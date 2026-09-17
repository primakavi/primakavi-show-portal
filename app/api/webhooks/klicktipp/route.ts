import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

function normalizeEmail(value: unknown) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // SECRET PRÜFEN
    // ============================================================

    const expectedSecret =
      process.env.KLICKTIPP_WEBHOOK_SECRET;

    if (!expectedSecret) {
      console.error(
        "KLICKTIPP_WEBHOOK_SECRET ist nicht gesetzt."
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Server configuration error",
        },
        { status: 500 }
      );
    }

    const secret =
      request.nextUrl.searchParams.get("secret");

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // BODY LESEN
    // KlickTipp sendet aktuell JSON.
    // Form Data unterstützen wir vorsichtshalber ebenfalls.
    // ============================================================

    const contentType =
      request.headers.get("content-type") || "";

    let body: Record<string, unknown> = {};

    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const formData = await request.formData();

      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }
    }

    console.log(
      "KlickTipp OPENED Webhook empfangen:",
      body
    );

    // ============================================================
    // KONTAKTDATEN AUSLESEN
    // ============================================================

    const email = normalizeEmail(
      body.email ||
        body.Email ||
        body["E-Mail"] ||
        body["email_address"]
    );

    const klicktippContactId = String(
      body.id ||
        body.external_user_id ||
        body.contact_id ||
        body.subscriber_id ||
        body.klicktipp_contact_id ||
        ""
    ).trim();

    // ============================================================
    // VALIDIERUNG
    //
    // Dieser Webhook wird in KlickTipp ausschließlich durch
    // "Veranstalter Newsletter September 2026 geöffnet" ausgelöst.
    //
    // Deshalb gilt:
    // Webhook empfangen = Newsletter geöffnet.
    // ============================================================

    if (!email) {
      console.warn(
        "KlickTipp OPENED Webhook ohne E-Mail:",
        body
      );

      return NextResponse.json(
        {
          ok: false,
          error: "No email supplied",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // PASSENDEN MAILING-EMPFÄNGER SUCHEN
    // ============================================================

    const {
      data: recipients,
      error: recipientsError,
    } = await supabaseAdmin
      .from("mailing_recipients")
      .select(`
        id,
        round_id,
        email,
        sent_at,
        scheduled_at,
        opened_at,
        clicked_at,
        acquisition_rounds (
          id,
          name,
          active,
          archived_at
        )
      `)
      .ilike("email", email);

    if (recipientsError) {
      console.error(
        "Fehler beim Suchen des Mailing-Empfängers:",
        recipientsError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Database lookup failed",
        },
        { status: 500 }
      );
    }

    if (!recipients?.length) {
      console.warn(
        `Kein Mailing-Empfänger für ${email} gefunden.`
      );

      // 200 zurückgeben, damit KlickTipp den Webhook
      // nicht wegen eines unbekannten Empfängers erneut versucht.
      return NextResponse.json({
        ok: true,
        matched: false,
      });
    }

    // ============================================================
    // PASSENDE MAILING-RUNDE BESTIMMEN
    //
    // 1. aktive Runde bevorzugen
    // 2. danach zuletzt versendet/geplant
    // ============================================================

    const sortedRecipients = [...recipients].sort(
      (a: any, b: any) => {
        const aActive =
          a.acquisition_rounds?.active ? 1 : 0;

        const bActive =
          b.acquisition_rounds?.active ? 1 : 0;

        if (aActive !== bActive) {
          return bActive - aActive;
        }

        const aDate =
          a.sent_at ||
          a.scheduled_at ||
          "";

        const bDate =
          b.sent_at ||
          b.scheduled_at ||
          "";

        return (
          new Date(bDate || 0).getTime() -
          new Date(aDate || 0).getTime()
        );
      }
    );

    const recipient = sortedRecipients[0];

    // ============================================================
    // ÖFFNUNG SPEICHERN
    // ============================================================

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    // Wir behalten bewusst den Zeitpunkt der ERSTEN Öffnung.
    if (!recipient.opened_at) {
      updateData.opened_at = now;
    }

    if (klicktippContactId) {
      updateData.klicktipp_contact_id =
        klicktippContactId;
    }

    // ============================================================
    // UPDATE
    // ============================================================

    const { error: updateError } =
      await supabaseAdmin
        .from("mailing_recipients")
        .update(updateData)
        .eq("id", recipient.id);

    if (updateError) {
      console.error(
        "Fehler beim Speichern der Newsletter-Öffnung:",
        updateError
      );

      return NextResponse.json(
        {
          ok: false,
          error: "Database update failed",
        },
        { status: 500 }
      );
    }

    // ============================================================
    // ERFOLG
    // ============================================================

    console.log(
      `Newsletter geöffnet gespeichert: ${email}`,
      recipient.id
    );

    return NextResponse.json({
      ok: true,
      matched: true,
      event: "opened",
      recipient_id: recipient.id,
      first_open:
        !recipient.opened_at,
    });
  } catch (error) {
    console.error(
      "KlickTipp OPENED Webhook Fehler:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}