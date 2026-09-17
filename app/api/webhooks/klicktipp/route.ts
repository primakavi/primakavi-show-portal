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
    //
    // KlickTipp kann Form Data oder JSON senden.
    // Wir unterstützen beides.
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
      "KlickTipp Webhook empfangen:",
      body
    );

    // ============================================================
    // DATEN AUSLESEN
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

    // ============================================================
    // VALIDIERUNG
    // ============================================================

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
    // Eine E-Mail-Adresse kann in mehreren Mailing-Runden
    // vorkommen. Deshalb suchen wir zunächst alle Treffer.
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

    // ============================================================
    // KEIN PASSENDER EMPFÄNGER
    // ============================================================

    if (!recipients?.length) {
      console.warn(
        `Kein Mailing-Empfänger für ${email} gefunden.`
      );

      // Bewusst HTTP 200:
      // KlickTipp soll den Webhook nicht ständig erneut versuchen.
      return NextResponse.json({
        ok: true,
        matched: false,
      });
    }

    // ============================================================
    // PASSENDE MAILING-RUNDE BESTIMMEN
    //
    // Bevorzugt:
    // 1. aktive Akquise-/Mailing-Runde
    // 2. zuletzt versendeter/geplanter Datensatz
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
    //
    // WICHTIG:
    // Dieser Endpoint wird aktuell ausschließlich von der
    // KlickTipp-Kampagne
    //
    // "CRM | Veranstalter Newsletter Klicks"
    //
    // ausgelöst.
    //
    // Deren Startbedingung lautet:
    // Newsletter → geklickt
    //
    // Deshalb bedeutet jeder Aufruf dieses Webhooks:
    // Der Empfänger hat den Newsletter geklickt.
    // ============================================================

    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      updated_at: now,
    };

    // ------------------------------------------------------------
    // ÖFFNUNG
    //
    // Ein Klick impliziert eine vorherige Öffnung.
    // Falls noch kein opened_at vorhanden ist, setzen wir ihn
    // ebenfalls auf den Zeitpunkt des ersten bekannten Klicks.
    // ------------------------------------------------------------

    if (!recipient.opened_at) {
      updateData.opened_at = now;
    }

    // ------------------------------------------------------------
    // KLICK
    //
    // Nur den ersten Klick-Zeitpunkt speichern.
    // Weitere Webhook-Aufrufe überschreiben ihn nicht.
    // ------------------------------------------------------------

    if (!recipient.clicked_at) {
      updateData.clicked_at = now;
    }

    // ------------------------------------------------------------
    // GEKLICKTE URL
    //
    // Nur speichern, wenn KlickTipp tatsächlich eine URL
    // mitsendet.
    // ------------------------------------------------------------

    if (clickedUrl) {
      updateData.last_clicked_url =
        clickedUrl;
    }

    // ------------------------------------------------------------
    // KLICKTIPP KONTAKT-ID
    // ------------------------------------------------------------

    if (klicktippContactId) {
      updateData.klicktipp_contact_id =
        klicktippContactId;
    }

    // ============================================================
    // UPDATE IN SUPABASE
    // ============================================================

    const { error: updateError } =
      await supabaseAdmin
        .from("mailing_recipients")
        .update(updateData)
        .eq("id", recipient.id);

    if (updateError) {
      console.error(
        "Fehler beim Speichern des Newsletter-Klicks:",
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
      `Newsletter-Klick gespeichert: ${email}`,
      recipient.id
    );

    return NextResponse.json({
      ok: true,
      matched: true,
      event: "clicked",
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