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
        { ok: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    const secret =
      request.nextUrl.searchParams.get("secret");

    if (!secret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ============================================================
    // BODY LESEN
    // KlickTipp kann Form Data oder JSON senden.
    // Wir unterstützen direkt beides.
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

    console.log("KlickTipp Webhook empfangen:", body);

    // ============================================================
    // DATEN AUSLESEN
    //
    // Wir erlauben mehrere mögliche Feldnamen.
    // Dann sind wir nicht davon abhängig, wie KlickTipp die
    // Variablen im Webhook exakt benennt.
    // ============================================================

    const email = normalizeEmail(
      body.email ||
        body.Email ||
        body["E-Mail"] ||
        body["email_address"]
    );

    const clickedUrl = String(
      body.clicked_url ||
        body.url ||
        body.link ||
        body["Link"] ||
        ""
    ).trim();

const klicktippContactId = String(
  body.id ||
    body.external_user_id ||
    body.contact_id ||
    body.subscriber_id ||
    body.klicktipp_contact_id ||
    ""
).trim();

    if (!email) {
      console.warn(
        "KlickTipp Webhook ohne E-Mail:",
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
    // EMPFÄNGER SUCHEN
    //
    // Es können theoretisch mehrere Mailing-Runden dieselbe
    // E-Mail enthalten. Wir nehmen bewusst nur noch nicht
    // archivierte/alte Treffer nicht blind alle:
    //
    // Zunächst suchen wir alle Empfänger mit dieser E-Mail.
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
        "Fehler beim Suchen des Empfängers:",
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

      // Trotzdem 200:
      // KlickTipp soll den Webhook nicht endlos erneut versuchen.
      return NextResponse.json({
        ok: true,
        matched: false,
      });
    }

    // ============================================================
    // PASSENDE MAILING-RUNDE BESTIMMEN
    //
    // Bevorzugt:
    // 1. aktive Mailing-Runde
    // 2. bereits versendet/geplant
    // 3. jüngster Datensatz
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
    // KLICK SPEICHERN
    // ============================================================

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      clicked_at: now,
      updated_at: now,
    };

    if (clickedUrl) {
      updateData.last_clicked_url =
        clickedUrl;
    }

    if (klicktippContactId) {
      updateData.klicktipp_contact_id =
        klicktippContactId;
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("mailing_recipients")
        .update(updateData)
        .eq("id", recipient.id);

    if (updateError) {
      console.error(
        "Fehler beim Speichern des Klicks:",
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
      `KlickTipp-Klick gespeichert: ${email}`,
      recipient.id
    );

    return NextResponse.json({
      ok: true,
      matched: true,
      recipient_id: recipient.id,
    });
  } catch (error) {
    console.error(
      "KlickTipp Webhook Fehler:",
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