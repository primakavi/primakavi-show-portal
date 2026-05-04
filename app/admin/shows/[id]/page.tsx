import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import CopyMailButtons from "./CopyMailButtons";
import FileUploadBox from "./FileUploadBox";

const CHECKLIST_GROUPS = [
  {
    title: "Vorbereitung",
    tone: "emerald",
    items: [
      "Formular vollständig",
      "Vertrag geklärt",
      "Technik geprüft",
      "Ablauf geprüft",
      "Hotel/Anreise geklärt",
      "Promo verschickt",
      "GEMA erledigt",
      "Markus informiert",
    ],
  },
  {
    title: "Showtag",
    tone: "amber",
    items: [
      "Ankunft / Zugang geklärt",
      "Backstage / Catering geklärt",
      "Show gespielt",
    ],
  },
  {
    title: "Nachbereitung",
    tone: "purple",
    items: [
      "Rechnung vorbereitet",
      "Rechnung geschickt",
      "Zahlung geprüft",
      "Feedback notiert",
      "Akte abgeschlossen",
    ],
  },
];

export default async function ShowAktePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; reviewed?: string }>;
}) {
  const { id } = await params;
  const { saved, reviewed } = await searchParams;

  const wasSaved = saved === "1";
  const wasReviewed = reviewed === "1";
  
  const { data: show, error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select(`
      *,
      show_files (*),
      show_portal_submissions (
        id,
        submitted_at,
        reviewed_at,
        data
      )
    `)
    .eq("id", id)
    .single();

  if (error || !show) notFound();

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const portalUrl = host
    ? `${protocol}://${host}/show/${show.token}`
    : `/show/${show.token}`;

  const progress = getProgress(show);
  const health = getShowHealth(show);
  const nextSteps = getNextSteps(show);
  const latestSubmission = getLatestSubmission(show);
  const newPortalInfo = hasNewPortalInfo(show);
  const filesWithUrls = await Promise.all(
  (show.show_files || []).map(async (file: any) => {
    const { data } = await supabaseAdmin.storage
      .from("show-files")
      .createSignedUrl(file.storage_path, 60 * 60);

    return {
      ...file,
      url: data?.signedUrl || null,
    };
  })
);

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 pb-32 text-zinc-950">
      <form action={updateShowAction}>
        <input type="hidden" name="id" value={show.id} />

        <div className="mx-auto max-w-7xl space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(221,242,26,0.16),transparent_24%),radial-gradient(circle_at_24%_34%,rgba(168,85,247,0.24),transparent_30%),radial-gradient(circle_at_76%_62%,rgba(236,72,153,0.32),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(221,242,26,0.12),transparent_24%)]" />
            <div className="absolute right-24 top-10 rotate-[10deg] text-5xl text-pink-400/70">
              ✦
            </div>
            <div className="absolute right-48 top-24 -rotate-[14deg] text-3xl text-white/20">
              ✧
            </div>

            <div className="relative grid gap-8 lg:grid-cols-[1fr_340px] lg:items-center">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.22em] text-zinc-300">
                  Show-Akte
                </p>

                <h1 className="mt-5 max-w-3xl text-5xl font-black leading-tight tracking-tight">
                  {show.venue || "Location offen"}
                </h1>

                <p className="mt-3 text-xl font-semibold text-zinc-300">
                  {show.program || "Programm offen"}
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <span
                    className={`rounded-full px-4 py-2 text-sm font-black ring-1 ${healthClass(
                      health.tone
                    )}`}
                  >
                    {health.emoji} {health.label}
                  </span>


                  {show.markus_included && (
                    <span className="rounded-full bg-purple-400/20 px-4 py-2 text-sm font-black text-purple-100 ring-1 ring-purple-300/30">
                      🎹 Markus dabei
                    </span>
                  )}

                  {show.follow_up_date && (
                    <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white">
                      WVL: {formatDate(show.follow_up_date)}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/15 bg-white/15 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="grid grid-cols-[100px_1fr] gap-5">
<div className="flex min-h-[140px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/15 p-4 text-center shadow-inner">
  <p className="text-xs font-black uppercase text-zinc-300">
    {show.weekday || "Datum"}
  </p>

  <p className="mt-2 text-5xl font-black leading-none">
    {formatDateParts(show.show_date).day}
  </p>

  <p className="mt-2 text-sm font-black uppercase leading-none">
    {formatDateParts(show.show_date).month}
  </p>

  <p className="mt-1 text-xs text-zinc-300">
    {formatDateParts(show.show_date).year}
  </p>
</div>
                  <div className="self-center">
                    <div className="space-y-3 text-sm">
                      <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100">
                        <p>Beginn: {show.start_time || "offen"}</p>
                        <p className="mt-1">
                          Einlass: {show.entry_time || "offen"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100">
                        <p>⌖ Adresse</p>
                        <p className="mt-1 text-zinc-200">
                          {show.venue_address || show.city || "Adresse offen"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <FormSection number="01" title="Veranstaltung" doodle="〰" tone="purple">
                <CompactGrid>
                  <Input name="artist" label="Artist" defaultValue={show.artist} />
                  <Input name="program" label="Programm" defaultValue={show.program} />
                  <Input name="show_date" label="Datum" type="date" defaultValue={show.show_date} />
                  <Input name="venue" label="Veranstaltungsort / Location" defaultValue={show.venue} />
                  <Input name="city" label="Stadt / Ort" defaultValue={show.city} />
                  <Input name="venue_address" label="Adresse" defaultValue={show.venue_address} />
                </CompactGrid>
              </FormSection>

              <FormSection number="02" title="Organisation & Kontakt" doodle="☆" tone="pink">
                <CompactGrid>
                  <Input name="contact_name" label="Ansprechpartner:in" defaultValue={show.contact_name} />
                  <Input name="contact_email" label="E-Mail" defaultValue={show.contact_email} />
                  <Input name="contact_phone" label="Telefon" defaultValue={show.contact_phone} />
                  <Input name="emergency_phone" label="Mobilnummer für Zugang am Veranstaltungstag" defaultValue={show.emergency_phone} />
                </CompactGrid>
              </FormSection>

              <FormSection number="03" title="Ablauf & Planung" doodle="↙" tone="orange">
                <CompactGrid>
                  <Input name="soundcheck_time" label="Aufbauzeit / Soundcheck" defaultValue={show.soundcheck_time} />
                  <Input name="entry_time" label="Einlass für die Gäste" defaultValue={show.entry_time} />
                  <Input name="start_time" label="Showbeginn" defaultValue={show.start_time} />
                  <Input name="arrival_time" label="Gewünschte Ankunft" defaultValue={show.arrival_time} />
                </CompactGrid>

                <Textarea name="schedule_notes" label="Besonderheiten zum Ablauf" defaultValue={show.schedule_notes} />
              </FormSection>

              <FormSection number="04" title="Technik" doodle="♫" tone="purple">
                <CompactGrid>
                  <CheckInput
                    name="tech_sound_available"
                    label="Ton vorhanden"
                    defaultChecked={show.tech_sound_available === true}
                  />
                  <CheckInput
                    name="tech_lights_available"
                    label="Licht vorhanden"
                    defaultChecked={show.tech_lights_available === true}
                  />
                  <Input name="piano_type" label="Klavier / Flügel" defaultValue={show.piano_type} />
                  <Input name="epiano_available" label="E-Piano" defaultValue={show.epiano_available} />
                  <Input name="piano_notes" label="Marke / Modell" defaultValue={show.piano_notes} />
                  <Input name="tech_contact" label="Technik-Ansprechpartner" defaultValue={show.tech_contact} />
                </CompactGrid>

                <Textarea name="tech_notes" label="Besonderheiten zur Technik" defaultValue={show.tech_notes} />
              </FormSection>

<FormSection number="05" title="Vertrag & Finanzen" doodle="♡" tone="orange">
  <CompactGrid>
    <Input name="contract_status" label="Aktueller Vertragsstatus" defaultValue={show.contract_status} />
    <Input name="fee" label="Honorar" defaultValue={show.fee} />
    <Input name="ticket_prices" label="Eintrittspreise" defaultValue={show.ticket_prices} />
    <Input name="capacity" label="Anzahl Plätze / Kapazität" defaultValue={show.capacity} />
    <Input name="free_tickets" label="Anzahl Freikarten" defaultValue={show.free_tickets} />
    <Input name="ticket_link" label="Ticketlink" defaultValue={show.ticket_link} />
    <Input name="invoice_email" label="Rechnungs-E-Mail" defaultValue={show.invoice_email} />
    <Input name="po_number" label="Bestellnummer / PO-Nummer" defaultValue={show.po_number} />
  </CompactGrid>

  <Textarea
    name="invoice_address"
    label="Rechnungsadresse"
    defaultValue={show.invoice_address}
  />

  <Textarea
    name="contract_notes"
    label="Hinweise zur Rechnung / Vertrag"
    defaultValue={show.contract_notes}
  />

  {show.contract_link && (
    <a
      href={show.contract_link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-fit rounded-2xl bg-white px-5 py-3 text-sm font-black text-zinc-950"
    >
      Vertrag öffnen →
    </a>
  )}
</FormSection>

              <FormSection number="06" title="Promotion" doodle="✦" tone="pink">
                <CompactGrid>
                  <Input name="flyers_needed" label="Werden Flyer benötigt?" defaultValue={show.flyers_needed} />
                  <Input name="flyer_amount" label="Anzahl Flyer" defaultValue={show.flyer_amount} />
                  <Input name="posters_needed" label="Werden Plakate benötigt?" defaultValue={show.posters_needed} />
                  <Input name="poster_details" label="Plakate: Anzahl & Größe" defaultValue={show.poster_details} />
                </CompactGrid>

                <Textarea name="promotion" label="Weitere Hinweise zur Promotion" defaultValue={show.promotion} />
              </FormSection>

              <FormSection number="07" title="Verpflegung & Backstage" doodle="〰" tone="teal">
                <CompactGrid>
                  <Input name="catering_status" label="Catering / Getränke vorgesehen?" defaultValue={show.catering_status} />
                  <Input name="catering_details" label="Details Catering" defaultValue={show.catering_details} />
                  <CheckInput
                    name="backstage_room_available"
                    label="Backstage-Raum vorhanden"
                    defaultChecked={show.backstage_room_available === true}
                  />
                  <CheckInput
                    name="backstage_mirror_available"
                    label="Spiegel vorhanden"
                    defaultChecked={show.backstage_mirror_available === true}
                  />
                  <CheckInput
                    name="backstage_seating_available"
                    label="Sitzgelegenheit vorhanden"
                    defaultChecked={show.backstage_seating_available === true}
                  />
                  <CheckInput
                    name="backstage_table_available"
                    label="Tisch vorhanden"
                    defaultChecked={show.backstage_table_available === true}
                  />
                  <CheckInput
                    name="backstage_no_room"
                    label="Kein Backstage-Raum vorhanden"
                    defaultChecked={show.backstage_no_room === true}
                  />
                </CompactGrid>

                <Textarea name="backstage_notes" label="Backstage-Notizen" defaultValue={show.backstage_notes} />
              </FormSection>

              <FormSection number="08" title="Unterkunft & Anreise" doodle="↗" tone="orange">
                <CompactGrid>
                  <Input name="accommodation_type" label="Wie ist die Unterkunft geregelt?" defaultValue={show.accommodation_type} />
                  <Input name="accommodation_hotel_name" label="Hotelname / Unterkunft" defaultValue={show.accommodation_hotel_name} />
                  <Input name="accommodation_buyout" label="Hotel-Buyout" defaultValue={show.accommodation_buyout} />
                  <Input name="accommodation_address" label="Hoteladresse" defaultValue={show.accommodation_address} />
                </CompactGrid>

                <Textarea name="accommodation_notes" label="Unterkunftsnotizen" defaultValue={show.accommodation_notes} />

                <CompactGrid>
                  <CheckInput
                    name="parking_available"
                    label="Parkplatz vorhanden"
                    defaultChecked={show.parking_available === true}
                  />
                  <CheckInput
                    name="loading_zone_available"
                    label="Ladezone vorhanden"
                    defaultChecked={show.loading_zone_available === true}
                  />
                  <CheckInput
                    name="no_parking_available"
                    label="Keine Parkmöglichkeit"
                    defaultChecked={!!show.no_parking_available === true}
                  />
                  <CheckInput
                    name="public_transport_recommended"
                    label="ÖPNV empfohlen"
                    defaultChecked={!!show.public_transport_recommended === true}
                  />
                  <Input name="parking_details" label="Parkdetails" defaultValue={show.parking_details} />
                </CompactGrid>

                <Textarea name="travel_notes" label="Details zur Anreise" defaultValue={show.travel_notes} />
              </FormSection>

              <FormSection number="09" title="Sonstiges" doodle="?" tone="zinc">
                <Textarea name="general_notes" label="Gibt es noch etwas, das wir wissen sollten?" defaultValue={show.general_notes} />
              </FormSection>

              <FormSection number="10" title="Checkliste" doodle="✓" tone="teal">
                <div className="space-y-6">
                  {CHECKLIST_GROUPS.map((group) => {
                    const groupProgress = getChecklistGroupProgress(show, group.items);

                    return (
                      <div key={group.title} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-black text-zinc-800">
                            {group.title}
                          </p>
                          <span className={`rounded-full px-3 py-1 text-xs font-black ${checklistTone(group.tone)}`}>
                            {groupProgress.done} / {groupProgress.total}
                          </span>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          {group.items.map((item) => {
                            const checked = isChecklistChecked(show, item);
                            const auto = isAutoChecklistItem(item);

                            return (
                              <label
                                key={item}
                                className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                                  checked
                                    ? checkedChecklistClass(group.tone)
                                    : "bg-white text-zinc-700"
                                }`}
                              >
                                <span className="flex items-center gap-3">
                                  <input
                                    type="checkbox"
                                    name={`checklist_${item}`}
                                    defaultChecked={checked}
                                    disabled={auto}
                                    className="h-5 w-5"
                                  />
                                  {item}
                                </span>

                                {auto && checked && (
                                  <span className="text-xs font-black opacity-70">
                                    auto
                                  </span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormSection>
            </section>

            <aside className="space-y-6 lg:top-8 lg:self-start">
              <SideCard title="Was ist jetzt zu tun?" tone="amber">
                {nextSteps.length === 0 ? (
                  <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-700">
                    Keine offenen Punkte. Diese Show ist spielbereit 🎉
                  </p>
                ) : (
                  <div className="space-y-3">
                    {nextSteps.map((task) => (
                      <div
                        key={task.label}
                        className={`rounded-2xl px-4 py-3 text-sm font-black ${
                          task.critical
                            ? "bg-rose-100 text-rose-800"
                            : "bg-white text-zinc-700"
                        }`}
                      >
                        {task.critical ? "⚠️ " : "→ "}
                        {task.label}
                      </div>
                    ))}
                  </div>
                )}
              </SideCard>

              <SideCard title="Interne Steuerung" tone="zinc">
                <div className="space-y-4">
                  <Select
                    name="internal_status"
                    label="Status intern"
                    defaultValue={show.internal_status}
                    options={[
                      ["neu", "Neu"],
                      ["offen", "Offen"],
                      ["in_arbeit", "In Arbeit"],
                      ["wartet_auf_veranstalter", "Wartet auf Veranstalter"],
                      ["wartet_auf_sonja", "Wartet auf Sonja"],
                      ["fertig", "Fertig"],
                      ["abgeschlossen", "Abgeschlossen"],
                      ["archiv", "Archiv"],
                    ]}
                  />

                  <Select
                    name="billing_status"
                    label="Abrechnung"
                    defaultValue={show.billing_status}
                    options={[
                      ["offen", "Offen"],
                      ["rechnung_zu_schreiben", "Rechnung zu schreiben"],
                      ["rechnung_verschickt", "Rechnung verschickt"],
                      ["bezahlt", "Bezahlt"],
                      ["nicht_relevant", "Nicht relevant"],
                    ]}
                  />

                  <Input name="next_step" label="Nächster Schritt manuell" defaultValue={show.next_step} />
                  <Input name="follow_up_date" label="Wiedervorlage" type="date" defaultValue={show.follow_up_date} />

                  <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700">
                    <input
                      type="checkbox"
                      name="markus_included"
                      defaultChecked={show.markus_included === true}
                      className="h-5 w-5"
                    />
                    🎹 Markus dabei
                  </label>

                  <Textarea name="markus_notes" label="Notizen für Markus" defaultValue={show.markus_notes} />
                </div>
                <Textarea
  name="sonja_notes"
  label="Interne Notizen für Sonja"
  defaultValue={show.sonja_notes}
/>
              </SideCard>

              <SideCard title="Formular Status" tone="purple">
                <div>
                  <p className="text-sm font-black text-purple-700">
                    {progress.done} / {progress.total} Pflichtinfos
                  </p>
                  <p className="mt-1 text-xs font-bold text-zinc-500">
                    Vollständigkeit der Veranstaltungsdaten
                  </p>
                </div>

                <div className="mt-4 h-2 rounded-full bg-purple-200">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>

                <div className="mt-5 space-y-2">
                  {progress.missing.length === 0 ? (
                    <p className="rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-700">
                      Alles vollständig 🎉
                    </p>
                  ) : (
                    progress.missing.map((item) => (
                      <p
                        key={item}
                        className="rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-zinc-700"
                      >
                        fehlt: {item}
                      </p>
                    ))
                  )}
                </div>
              </SideCard>

              <SideCard title="Formular & Mail" tone="teal">
                <div className="break-all rounded-2xl bg-white/80 p-4 text-sm font-bold text-zinc-700">
                  {portalUrl}
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <a
                    href={`/show/${show.token}`}
                    target="_blank"
                    className="rounded-2xl bg-zinc-950 px-5 py-3 text-center text-sm font-black text-white"
                  >
                    Formular öffnen →
                  </a>

                  <CopyMailButtons show={show} portalUrl={portalUrl} />
                </div>
              </SideCard>
<SideCard title="Dateien" tone="zinc">
  <FileUploadBox token={show.token} />

<div className="mt-5">
  {filesWithUrls.length ? (
    <div className="space-y-3">
      {filesWithUrls.map((file: any) => {
        const fileUrl = file.url;

        return fileUrl ? (
          <a
            key={file.id}
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-2xl bg-white px-4 py-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-50"
          >
            <p className="font-black text-zinc-950">
              {file.file_name || "Datei"}
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              {file.file_type || "Sonstiges"}
            </p>
            <p className="mt-2 text-xs font-black text-pink-500">
              öffnen →
            </p>
          </a>
        ) : (
          <div
            key={file.id}
            className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-zinc-700"
          >
            <p className="font-black text-zinc-950">
              {file.file_name || "Datei"}
            </p>
            <p className="mt-1 text-xs text-red-500">
              Datei-Link konnte nicht erstellt werden.
            </p>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-zinc-500">
      Noch keine Dateien hochgeladen.
    </p>
  )}
</div>

</SideCard>  
          </aside>
          </div>
        </div>

<div className="fixed bottom-5 left-[calc(18rem+2rem)] right-8 z-30 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl">
  <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="font-black">
        {wasSaved
          ? "✓ Akte gespeichert"
          : wasReviewed
            ? "✓ Portalinfos geprüft"
            : newPortalInfo
              ? "✨ Portalinfos prüfen"
              : "Akte speichern"}
      </p>

      <p
        className={`text-sm ${
          wasSaved || wasReviewed
            ? "text-emerald-300"
            : newPortalInfo
              ? "text-pink-200"
              : "text-zinc-400"
        }`}
      >
        {wasSaved
          ? "Deine Änderungen wurden übernommen."
          : wasReviewed
            ? "Die Formularinfos wurden als geprüft markiert."
            : newPortalInfo
              ? "Im Portal wurden seit der letzten Prüfung Angaben gespeichert."
              : "Änderungen werden erst nach dem Speichern übernommen."}
      </p>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      {newPortalInfo && (
        <>
          <input type="hidden" name="show_id" value={show.id} />
          <input
            type="hidden"
            name="submission_id"
            value={latestSubmission?.id || ""}
          />

          <button
            type="submit"
            formAction={markPortalReviewedAction}
            className="rounded-full bg-purple-100 px-6 py-3 text-sm font-black text-purple-900 shadow-lg transition hover:scale-[1.02]"
          >
            Portalinfos geprüft ✓
          </button>
        </>
      )}

      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-9 py-4 font-black text-white shadow-lg transition hover:scale-[1.02]"
      >
        Akte speichern →
      </button>
    </div>
  </div>
</div>      </form>
    </main>
  );
}

async function updateShowAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const showDate = value(formData, "show_date");
  const checklist = buildChecklist(formData);

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({
      artist: value(formData, "artist"),
      program: value(formData, "program"),
      show_date: showDate,
      weekday: getWeekday(showDate),
      venue: value(formData, "venue"),
      city: value(formData, "city"),
      venue_address: value(formData, "venue_address"),

      contact_name: value(formData, "contact_name"),
      contact_email: value(formData, "contact_email"),
      contact_phone: value(formData, "contact_phone"),
      emergency_phone: value(formData, "emergency_phone"),

      soundcheck_time: value(formData, "soundcheck_time"),
      entry_time: value(formData, "entry_time"),
      start_time: value(formData, "start_time"),
      arrival_time: value(formData, "arrival_time"),
      schedule_notes: value(formData, "schedule_notes"),

      tech_sound_available: formData.get("tech_sound_available") === "on",
      tech_lights_available: formData.get("tech_lights_available") === "on",
      piano_type: value(formData, "piano_type"),
      epiano_available: value(formData, "epiano_available"),
      piano_notes: value(formData, "piano_notes"),
      tech_contact: value(formData, "tech_contact"),
      tech_notes: value(formData, "tech_notes"),

      contract_status: value(formData, "contract_status"),
      fee: value(formData, "fee"),
      ticket_prices: value(formData, "ticket_prices"),
      capacity: value(formData, "capacity"),
      ticket_link: value(formData, "ticket_link"),
      free_tickets: value(formData, "free_tickets"),
      invoice_email: value(formData, "invoice_email"),
      invoice_address: value(formData, "invoice_address"),
      po_number: value(formData, "po_number"),
      contract_notes: value(formData, "contract_notes"),

      flyers_needed: value(formData, "flyers_needed"),
      flyer_amount: value(formData, "flyer_amount"),
      posters_needed: value(formData, "posters_needed"),
      poster_details: value(formData, "poster_details"),
      promotion: value(formData, "promotion"),

      catering_status: value(formData, "catering_status"),
      catering_details: value(formData, "catering_details"),

      backstage_room_available:
        formData.get("backstage_room_available") === "on",
      backstage_mirror_available:
        formData.get("backstage_mirror_available") === "on",
      backstage_seating_available:
        formData.get("backstage_seating_available") === "on",
      backstage_table_available:
        formData.get("backstage_table_available") === "on",
      backstage_no_room: formData.get("backstage_no_room") === "on",
      backstage_notes: value(formData, "backstage_notes"),

      accommodation_type: value(formData, "accommodation_type"),
      accommodation_hotel_name: value(formData, "accommodation_hotel_name"),
      accommodation_address: value(formData, "accommodation_address"),
      accommodation_buyout: value(formData, "accommodation_buyout"),
      accommodation_notes: value(formData, "accommodation_notes"),

      parking_available: formData.get("parking_available") === "on",
      loading_zone_available: formData.get("loading_zone_available") === "on",
      no_parking_available: formData.get("no_parking_available") === "on",
      public_transport_recommended:
        formData.get("public_transport_recommended") === "on",
      parking_details: value(formData, "parking_details"),
      travel_notes: value(formData, "travel_notes"),

      general_notes: value(formData, "general_notes"),

      internal_status: lastValue(formData, "internal_status"),
      billing_status: lastValue(formData, "billing_status"),
      next_step: value(formData, "next_step"),
      follow_up_date: value(formData, "follow_up_date"),
      markus_included: formData.get("markus_included") === "on",
markus_notes: value(formData, "markus_notes"),
sonja_notes: value(formData, "sonja_notes"),
checklist,    })
    .eq("id", id);

  if (error) throw new Error(error.message);

revalidateAkte(id);
redirect(`/admin/shows/${id}?saved=1`);
}

async function applyPortalFieldAction(formData: FormData) {
  const showId = String(formData.get("show_id") || "");
  const field = String(formData.get("field") || "");
  const incomingValue = String(formData.get("value") || "");

  if (!showId || !field) return;

  if (!PORTAL_FIELD_LABELS[field]) {
    throw new Error("Dieses Feld darf nicht übernommen werden.");
  }

  const isBooleanField = BOOLEAN_PORTAL_FIELDS.includes(field);

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({
      [field]: isBooleanField ? incomingValue === "true" : incomingValue || null,
    })
    .eq("id", showId);

  if (error) throw new Error(error.message);

revalidateAkte(showId);
redirect(`/admin/shows/${showId}?reviewed=1`);
}

async function markPortalReviewedAction(formData: FormData) {
  "use server";

  const showId = String(formData.get("show_id") || "");
  const submissionId = String(formData.get("submission_id") || "");

  if (!showId) return;

  const now = new Date().toISOString();

  const { error: showError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({
      last_reviewed_at: now,
    })
    .eq("id", showId);

  if (showError) throw new Error(showError.message);

  if (submissionId) {
    const { error: submissionError } = await supabaseAdmin
      .schema("booking")
      .from("show_portal_submissions")
      .update({
        reviewed_at: now,
      })
      .eq("id", submissionId);

    if (submissionError) throw new Error(submissionError.message);
  }

revalidateAkte(showId);
redirect(`/admin/shows/${showId}?reviewed=1`);
}

function revalidateAkte(id: string) {
  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/admin/markus");
}

function buildChecklist(formData: FormData) {
  const checklist: Record<string, boolean> = {};

  for (const group of CHECKLIST_GROUPS) {
    for (const item of group.items) {
      if (isAutoChecklistItem(item)) continue;
      checklist[item] = formData.get(`checklist_${item}`) === "on";
    }
  }

  checklist["Formular vollständig"] = isPortalCompleteFromForm(formData);

  const contractStatus = String(
    value(formData, "contract_status") || ""
  ).toLowerCase();

  checklist["Vertrag geklärt"] =
    contractStatus.includes("vertrag liegt vor") ||
    contractStatus.includes("erstellt") ||
    contractStatus.includes("unterschrieben");

  const billingStatus = value(formData, "billing_status");

  if (billingStatus === "rechnung_verschickt" || billingStatus === "bezahlt") {
    checklist["Rechnung geschickt"] = true;
  }

  if (billingStatus === "bezahlt") {
    checklist["Zahlung geprüft"] = true;
  }

  return checklist;
}

function isPortalCompleteFromForm(formData: FormData) {
  const hasTech =
    formData.get("tech_sound_available") === "on" ||
    formData.get("tech_lights_available") === "on" ||
    !!value(formData, "tech_notes") ||
    !!value(formData, "piano_type");

  const hasTravel =
    formData.get("parking_available") === "on" ||
    formData.get("loading_zone_available") === "on" ||
    formData.get("no_parking_available") === "on" ||
    formData.get("public_transport_recommended") === "on" ||
    !!value(formData, "travel_notes");

  const required = [
    value(formData, "show_date"),
    value(formData, "venue"),
    value(formData, "city"),
    value(formData, "start_time"),
    value(formData, "contact_name"),
    value(formData, "contact_email"),
    value(formData, "venue_address"),
    hasTech ? "ok" : null,
    value(formData, "fee"),
    value(formData, "contract_status"),
    value(formData, "ticket_prices"),
    value(formData, "capacity"),
    hasTravel ? "ok" : null,
    value(formData, "accommodation_type") ||
      value(formData, "accommodation_notes"),
  ];

  return required.every(Boolean);
}

function getProgress(show: any) {
  const hasTech =
    show.tech_sound_available ||
    show.tech_lights_available ||
    show.tech_notes ||
    show.piano_type;

  const hasTravel =
    show.parking_available ||
    show.loading_zone_available ||
    show.no_parking_available ||
    show.public_transport_recommended ||
    show.travel_notes;

  const fields = [
    ["Datum", show.show_date],
    ["Location", show.venue],
    ["Stadt", show.city],
    ["Beginn", show.start_time],
    ["Kontakt", show.contact_name],
    ["E-Mail", show.contact_email],
    ["Adresse", show.venue_address],
    ["Technik", hasTech],
    ["Honorar", show.fee],
    ["Vertragsstatus", show.contract_status],
    ["Eintrittspreise", show.ticket_prices],
    ["Kapazität", show.capacity],
    ["Anreise", hasTravel],
    ["Unterkunft", show.accommodation_type || show.accommodation_notes],
  ];

  const done = fields.filter(([, fieldValue]) => !!fieldValue).length;
  const total = fields.length;

  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    missing: fields
      .filter(([, fieldValue]) => !fieldValue)
      .map(([label]) => label),
  };
}

function getShowHealth(show: any) {
  const tasks = getNextSteps(show);
  const showDate = parseDateOnly(show.show_date);
  const today = startOfToday();
  const isPast = showDate && showDate < today;

  if (isPast && show.billing_status !== "bezahlt") {
    return { label: "Nachbereitung", tone: "blue", emoji: "🔵" };
  }

  if (tasks.some((task) => task.critical)) {
    return { label: "Kritisch offen", tone: "red", emoji: "🔴" };
  }

  if (tasks.length === 0) {
    return { label: "Spielbereit", tone: "green", emoji: "🟢" };
  }

  return { label: "In Vorbereitung", tone: "yellow", emoji: "🟡" };
}

function getNextSteps(show: any) {
  const tasks: { label: string; critical?: boolean }[] = [];
  const showDate = parseDateOnly(show.show_date);
  const today = startOfToday();
  const isPast = showDate && showDate < today;

  if (isPast) {
    if (
      show.billing_status !== "rechnung_verschickt" &&
      show.billing_status !== "bezahlt" &&
      show.billing_status !== "nicht_relevant"
    ) {
      tasks.push({ label: "Rechnung vorbereiten", critical: true });
    }

    if (show.billing_status === "rechnung_verschickt") {
      tasks.push({ label: "Zahlung prüfen" });
    }

    if (!show.checklist?.["Feedback notiert"]) {
      tasks.push({ label: "Feedback / Nachbereitung notieren" });
    }

    return tasks;
  }

  if (hasNewPortalInfo(show)) {
    tasks.push({ label: "Neue Formularinfos prüfen", critical: true });
  }

  if (!show.contact_name || !show.contact_email) {
    tasks.push({ label: "Kontakt vervollständigen", critical: true });
  }

  if (!show.venue_address) {
    tasks.push({ label: "Adresse klären", critical: true });
  }

  if (!show.start_time || !show.entry_time) {
    tasks.push({ label: "Ablauf / Timing klären", critical: true });
  }

  if (
    !show.tech_sound_available &&
    !show.tech_lights_available &&
    !show.tech_notes &&
    !show.piano_type
  ) {
    tasks.push({ label: "Technik prüfen", critical: true });
  }

  if (!isContractCleared(show)) {
    tasks.push({ label: "Vertrag klären", critical: true });
  }

  if (
    !show.parking_available &&
    !show.loading_zone_available &&
    !show.no_parking_available &&
    !show.public_transport_recommended &&
    !show.travel_notes
  ) {
    tasks.push({ label: "Anreise klären" });
  }

  if (!show.accommodation_type && !show.accommodation_notes) {
    tasks.push({ label: "Unterkunft klären" });
  }

  if (show.markus_included && !show.checklist?.["Markus informiert"]) {
    tasks.push({ label: "Markus informieren" });
  }

  const wantsPromo =
    show.flyers_needed === "Ja" ||
    show.posters_needed === "Ja" ||
    String(show.promotion || "").toLowerCase().includes("flyer") ||
    String(show.promotion || "").toLowerCase().includes("plakate");

  if (wantsPromo && !show.checklist?.["Promo verschickt"]) {
    tasks.push({ label: "Promo-Material vorbereiten" });
  }

  if (getProgress(show).missing.length === 0 && show.internal_status !== "fertig") {
    tasks.push({ label: "Akte final prüfen" });
  }

  return tasks;
}

const BOOLEAN_PORTAL_FIELDS = [
  "tech_sound_available",
  "tech_lights_available",
  "backstage_room_available",
  "backstage_mirror_available",
  "backstage_seating_available",
  "backstage_table_available",
  "backstage_no_room",
  "parking_available",
  "loading_zone_available",
  "no_parking_available",
  "public_transport_recommended",
];

const PORTAL_FIELD_LABELS: Record<string, string> = {
  artist: "Artist",
  program: "Programm",
  show_date: "Datum",
  venue: "Location",
  city: "Stadt / Ort",
  venue_address: "Adresse",

  contact_name: "Ansprechpartner:in",
  contact_email: "E-Mail",
  contact_phone: "Telefon",
  emergency_phone: "Mobilnummer Veranstaltungstag",

  soundcheck_time: "Aufbauzeit / Soundcheck",
  entry_time: "Einlass",
  start_time: "Showbeginn",
  arrival_time: "Gewünschte Ankunft",
  schedule_notes: "Ablaufnotizen",

  tech_sound_available: "Ton vorhanden",
  tech_lights_available: "Licht vorhanden",
  piano_type: "Klavier / Flügel",
  epiano_available: "E-Piano",
  piano_notes: "Piano / Modell",
  tech_contact: "Technik-Ansprechpartner",
  tech_notes: "Techniknotizen",

  contract_status: "Vertragsstatus",
  fee: "Honorar",
  ticket_prices: "Eintrittspreise",
  capacity: "Kapazität",
  ticket_link: "Ticketlink",
  free_tickets: "Freikarten",
  invoice_email: "Rechnungs-E-Mail",
  invoice_address: "Rechnungsadresse",
  po_number: "Bestellnummer / PO-Nummer",
  contract_notes: "Vertrags-/Rechnungshinweise",

  flyers_needed: "Flyer benötigt?",
  flyer_amount: "Flyeranzahl",
  posters_needed: "Plakate benötigt?",
  poster_details: "Plakatdetails",
  promotion: "Promotion-Hinweise",

  catering_status: "Catering Status",
  catering_details: "Catering Details",

  backstage_room_available: "Backstage-Raum",
  backstage_mirror_available: "Spiegel",
  backstage_seating_available: "Sitzgelegenheit",
  backstage_table_available: "Tisch",
  backstage_no_room: "Kein Backstage-Raum",
  backstage_notes: "Backstage-Notizen",

  accommodation_type: "Unterkunftsart",
  accommodation_hotel_name: "Hotelname / Unterkunft",
  accommodation_address: "Hoteladresse",
  accommodation_buyout: "Hotel-Buyout",
  accommodation_notes: "Unterkunftsnotizen",

  parking_available: "Parkplatz vorhanden?",
  loading_zone_available: "Ladezone vorhanden?",
  no_parking_available: "Keine Parkmöglichkeit",
  public_transport_recommended: "ÖPNV empfohlen",
  parking_details: "Parkplatzdetails",
  travel_notes: "Anreisehinweise",

  general_notes: "Sonstiges",
};

function getPortalDiffs(show: any, latestSubmission: any) {
  const data = latestSubmission?.data || {};

  return Object.entries(PORTAL_FIELD_LABELS)
    .map(([field, label]) => {
      const current = normalizeCompareValue(show[field]);
      const incoming = normalizeCompareValue(data[field]);

      return {
        field,
        label,
        current,
        incoming,
        changed: incoming !== "" && current !== incoming,
      };
    })
    .filter((item) => item.changed);
}

function normalizeCompareValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function hasNewPortalInfo(show: any) {
  const latestSubmission = getLatestSubmission(show);

  if (!latestSubmission?.submitted_at) return false;
  if (!show.last_reviewed_at) return true;

  return (
    new Date(latestSubmission.submitted_at).getTime() >
    new Date(show.last_reviewed_at).getTime()
  );
}

function getLatestSubmission(show: any) {
  const submissions = show.show_portal_submissions || [];

  return [...submissions].sort((a: any, b: any) => {
    return (
      new Date(b.submitted_at || "").getTime() -
      new Date(a.submitted_at || "").getTime()
    );
  })[0];
}

function hasContractFile(show: any) {
  return (show.show_files || []).some((file: any) => {
    const text = `${file.file_type || ""} ${file.file_name || ""}`.toLowerCase();
    return text.includes("vertrag");
  });
}

function isContractCleared(show: any) {
  const status = String(show.contract_status || "").toLowerCase();

  return (
    status.includes("vertrag liegt vor") ||
    status.includes("erstellt") ||
    status.includes("unterschrieben") ||
    hasContractFile(show)
  );
}

function isAutoChecklistItem(item: string) {
  return item === "Formular vollständig" || item === "Vertrag geklärt";
}

function isChecklistChecked(show: any, item: string) {
  if (item === "Formular vollständig") {
    return getProgress(show).missing.length === 0;
  }

  if (item === "Vertrag geklärt") {
    return isContractCleared(show);
  }

  return !!show.checklist?.[item];
}

function getChecklistGroupProgress(show: any, items: string[]) {
  return {
    done: items.filter((item) => isChecklistChecked(show, item)).length,
    total: items.length,
  };
}

function FormSection({
  number,
  title,
  doodle,
  tone,
  children,
}: {
  number: string;
  title: string;
  doodle: string;
  tone: "purple" | "pink" | "orange" | "teal" | "zinc";
  children: React.ReactNode;
}) {
  const theme = getTheme(tone);

  return (
    <section className="relative rounded-[1.75rem] bg-white p-6 shadow-xl shadow-zinc-200/70">
      <span
        className={`absolute right-7 top-7 rotate-[-8deg] text-3xl font-black opacity-50 ${theme.doodle}`}
      >
        {doodle}
      </span>

      <div className="mb-6 flex items-start gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.number} text-xl font-black text-zinc-900`}
        >
          {number}
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight">{title}</h2>
          <p className="mt-1 text-sm font-semibold text-zinc-500">
            {sectionDescription(title)}
          </p>
        </div>
      </div>

      <div className={`grid gap-5 rounded-3xl border-2 border-dashed p-5 ${theme.shell}`}>
        {children}
      </div>
    </section>
  );
}

function SideCard({
  title,
  tone,
  children,
}: {
  title: string;
  tone: "purple" | "amber" | "teal" | "zinc";
  children: React.ReactNode;
}) {
  const styles = {
    purple: "border-purple-200 bg-purple-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    teal: "border-teal-200 bg-teal-50/70",
    zinc: "border-zinc-200 bg-zinc-50/70",
  }[tone];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-xl shadow-zinc-200/70">
      <h3 className="mb-4 text-lg font-black">{title}</h3>
      <div className={`rounded-3xl border-2 border-dashed p-4 ${styles}`}>
        {children}
      </div>
    </section>
  );
}

function CompactGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function CheckInput({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-5 w-5"
      />
      {label}
    </label>
  );
}

function Input({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | number | boolean | null;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={
          typeof defaultValue === "string" || typeof defaultValue === "number"
            ? defaultValue
            : ""
        }
        className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  options: [string, string][];
}) {
  const safeDefaultValue = defaultValue || "offen";

  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700">
      {label}
      <select
        key={`${name}-${safeDefaultValue}`}
        name={name}
        defaultValue={safeDefaultValue}
        className="h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | boolean | null;
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700 md:col-span-2">
      {label}
      <textarea
        name={name}
        defaultValue={
          typeof defaultValue === "string" || typeof defaultValue === "number"
            ? defaultValue
            : ""
        }
        rows={5}
        className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
      />
    </label>
  );
}

function getTheme(tone: string) {
  const themes: Record<string, any> = {
    purple: {
      shell: "border-purple-200 bg-purple-50/60",
      number: "from-purple-200 to-pink-300",
      doodle: "text-purple-400",
    },
    pink: {
      shell: "border-pink-200 bg-pink-50/60",
      number: "from-pink-200 to-rose-300",
      doodle: "text-pink-400",
    },
    orange: {
      shell: "border-orange-200 bg-orange-50/60",
      number: "from-amber-200 to-orange-300",
      doodle: "text-orange-400",
    },
    teal: {
      shell: "border-teal-200 bg-teal-50/60",
      number: "from-teal-200 to-emerald-300",
      doodle: "text-teal-500",
    },
    zinc: {
      shell: "border-zinc-200 bg-zinc-50/70",
      number: "from-zinc-200 to-zinc-300",
      doodle: "text-zinc-400",
    },
  };

  return themes[tone] || themes.zinc;
}

function sectionDescription(title: string) {
  const descriptions: Record<string, string> = {
    Veranstaltung: "Grunddaten zum Auftritt.",
    "Organisation & Kontakt": "Wer ist vor Ort erreichbar?",
    "Ablauf & Planung": "Alles für Timing und Ablauf.",
    Technik: "Technische Anforderungen und Hinweise.",
    "Vertrag & Finanzen": "Vertrag, Honorar und Rechnungsdaten.",
    Promotion: "Werbematerial und Ankündigungen.",
    "Verpflegung & Backstage": "Catering, Garderobe und Ausstattung.",
    "Unterkunft & Anreise": "Hotel, Anfahrt und Besonderheiten.",
    Sonstiges: "Alles, was sonst noch wichtig ist.",
    Checkliste: "Interne Vorbereitung und Nachbereitung.",
  };

  return descriptions[title] || "";
}

function checklistTone(tone: string) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return tones[tone] || "bg-zinc-100 text-zinc-700";
}

function checkedChecklistClass(tone: string) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-purple-100 text-purple-800",
  };

  return tones[tone] || "bg-zinc-100 text-zinc-800";
}

function healthClass(tone: string) {
  const tones: Record<string, string> = {
    green: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    yellow: "bg-amber-100 text-amber-800 ring-amber-200",
    red: "bg-rose-100 text-rose-800 ring-rose-200",
    blue: "bg-sky-100 text-sky-800 ring-sky-200",
  };

  return tones[tone] || "bg-zinc-100 text-zinc-800 ring-zinc-200";
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (raw === null) return null;

  const stringValue = String(raw).trim();
  return stringValue === "" ? null : stringValue;
}

function lastValue(formData: FormData, key: string) {
  return (
    formData
      .getAll(key)
      .map((v) => String(v).trim())
      .filter(Boolean)
      .at(-1) || null
  );
}

function getWeekday(date?: string | null) {
  const d = parseDateOnly(date);
  if (!d) return null;

  return d.toLocaleDateString("de-DE", { weekday: "long" }).toUpperCase();
}

function formatDate(date?: string | null) {
  const d = parseDateOnly(date);
  if (!d) return date || "Datum offen";

  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateParts(date?: string | null) {
  const d = parseDateOnly(date);

  if (!d) {
    return {
      day: "--",
      month: "---",
      year: "----",
    };
  }

  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d
      .toLocaleDateString("de-DE", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
    year: String(d.getFullYear()),
  };
}

function parseDateOnly(date?: string | null) {
  if (!date) return null;

  const [year, month, day] = date.split("-").map(Number);
  if (!year || !month || !day) return null;

  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return null;

  return d;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}