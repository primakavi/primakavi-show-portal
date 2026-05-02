import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
import CopyMailButtons from "./CopyMailButtons";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: show, error } = await supabaseAdmin
    .from("shows")
    .select(`
      *,
      show_files (*)
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

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 pb-32 text-zinc-950">
      <form action={updateShowAction}>
        <input type="hidden" name="id" value={show.id} />

        <div className="mx-auto max-w-7xl space-y-6">
          <header className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-10 text-white shadow-2xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(221,242,26,0.16),transparent_24%),radial-gradient(circle_at_24%_34%,rgba(168,85,247,0.24),transparent_30%),radial-gradient(circle_at_76%_62%,rgba(236,72,153,0.32),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(221,242,26,0.12),transparent_24%)]" />
            <div className="absolute right-120 top-8 text-7xl text-pink-400/80">
              ♕
            </div>
            <div className="absolute bottom-8 right-180 text-5xl text-orange-300/90">
              ★
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
                  <div className="rounded-3xl border border-white/10 bg-white/15 p-4 text-center shadow-inner">
                    <p className="text-xs font-black uppercase text-zinc-300">
                      {show.weekday || "SHOW"}
                    </p>
                    <p className="mt-1 text-5xl font-black">
                      {formatDateParts(show.show_date).day}
                    </p>
                    <p className="text-sm font-black">
                      {formatDateParts(show.show_date).month}
                    </p>
                    <p className="text-xs text-zinc-300">
                      {formatDateParts(show.show_date).year}
                    </p>
                  </div>

<div className="self-center">
  <div className="space-y-3 text-sm">
    <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100">
      <p>Beginn: {show.start_time || "offen"}</p>
      <p className="mt-1">Einlass: {show.entry_time || "offen"}</p>
    </div>

    <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100">
      <p>⌖ Adresse</p>
      <p className="mt-1 text-zinc-200">
        {show.venue_address || show.city || "Adresse offen"}
      </p>
    </div>
  </div>
</div>                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <section className="space-y-6">
              <FormSection
                number="01"
                title="Veranstaltung"
                doodle="〰"
                tone="purple"
              >
                <CompactGrid>
                  <Input name="artist" label="Artist" defaultValue={show.artist} />
                  <Input name="program" label="Programm" defaultValue={show.program} />
                  <Input name="show_date" label="Datum" type="date" defaultValue={show.show_date} />
                  <Input name="venue" label="Location" defaultValue={show.venue} />
                  <Input name="city" label="Stadt" defaultValue={show.city} />
                  <Input name="entry_time" label="Einlass" defaultValue={show.entry_time} />
                  <Input name="start_time" label="Beginn" defaultValue={show.start_time} />
                </CompactGrid>
              </FormSection>

              <FormSection
                number="02"
                title="Kontakt vor Ort"
                doodle="☆"
                tone="pink"
              >
                <CompactGrid>
                  <Input name="contact_name" label="Ansprechpartner:in" defaultValue={show.contact_name} />
                  <Input name="contact_email" label="E-Mail" defaultValue={show.contact_email} />
                  <Input name="contact_phone" label="Telefon" defaultValue={show.contact_phone} />
                  <Input name="venue_address" label="Adresse" defaultValue={show.venue_address} />
                </CompactGrid>
              </FormSection>

              <FormSection number="03" title="Ablauf" doodle="↙" tone="orange">
                <Textarea name="schedule" label="Ablauf / Timing" defaultValue={show.schedule} />
              </FormSection>

              <FormSection number="04" title="Technik" doodle="♫" tone="purple">
                <Textarea name="technik" label="Technik" defaultValue={show.technik} />
              </FormSection>

              <FormSection
                number="05"
                title="Vertrag & Finanzen"
                doodle="♡"
                tone="orange"
              >
                <Textarea
                  name="finance_summary"
                  label="Vertrag, Honorar, Tickets & Rechnung"
                  defaultValue={financeSummary(show)}
                />

                <input type="hidden" name="contract_status" defaultValue={show.contract_status || ""} />
                <input type="hidden" name="fee" defaultValue={show.fee || ""} />
                <input type="hidden" name="ticket_prices" defaultValue={show.ticket_prices || ""} />
                <input type="hidden" name="capacity" defaultValue={show.capacity || ""} />
                <input type="hidden" name="free_tickets" defaultValue={show.free_tickets || ""} />
                <input type="hidden" name="ticket_link" defaultValue={show.ticket_link || ""} />
                <input type="hidden" name="invoice_email" defaultValue={show.invoice_email || ""} />
                <input type="hidden" name="invoice_address" defaultValue={show.invoice_address || ""} />
                <input type="hidden" name="contract_notes" defaultValue={show.contract_notes || ""} />
              </FormSection>

              <FormSection number="06" title="Promotion" doodle="✦" tone="pink">
                <Textarea name="promotion" label="Promotion / Material / Hinweise" defaultValue={show.promotion} />
              </FormSection>

              <FormSection
                number="07"
                title="Anreise, Hotel & Backstage"
                doodle="↗"
                tone="teal"
              >
                <Textarea
                  name="travel_summary"
                  label="Anreise, Unterkunft, Catering & Backstage"
                  defaultValue={travelSummary(show)}
                />

                <input type="hidden" name="anreise" defaultValue={show.anreise || show.travel_details || ""} />
                <input type="hidden" name="unterkunft" defaultValue={show.unterkunft || show.accommodation_notes || ""} />
                <input type="hidden" name="catering_details" defaultValue={show.catering_details || ""} />
                <input type="hidden" name="backstage_equipment" defaultValue={show.backstage_equipment || ""} />
              </FormSection>

              <FormSection
                number="08"
                title="Vorbereitung & Nachbereitung"
                doodle="✓"
                tone="teal"
              >
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

              <FormSection number="09" title="Notizen" doodle="?" tone="zinc">
                <Textarea name="general_notes" label="Interne / allgemeine Notizen" defaultValue={show.general_notes} />
              </FormSection>
            </section>

            <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
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
                      defaultChecked={!!show.markus_included}
                      className="h-5 w-5"
                    />
                    🎹 Markus dabei
                  </label>
                  <Textarea
  name="markus_notes"
  label="Notizen für Markus"
  defaultValue={show.markus_notes}
/>
                </div>
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
            </aside>
          </div>
        </div>

        <div className="fixed bottom-5 left-[calc(18rem+2rem)] right-8 z-30 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div>
              <p className="font-black">Akte speichern</p>
              <p className="text-sm text-zinc-400">
                Änderungen werden erst nach dem Speichern übernommen.
              </p>
            </div>

            <button
              type="submit"
              className="rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-9 py-4 font-black text-white shadow-lg transition hover:scale-[1.02]"
            >
              Akte speichern →
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}

async function updateShowAction(formData: FormData) {
  "use server";

  const id = String(formData.get("id") || "");
  const showDate = value(formData, "show_date");

  const internalStatusValues = formData
    .getAll("internal_status")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const billingStatusValues = formData
    .getAll("billing_status")
    .map((v) => String(v).trim())
    .filter(Boolean);

  const internalStatus = internalStatusValues.at(-1) || null;
  const billingStatus = billingStatusValues.at(-1) || null;

  const parsedFinance = parseFinanceSummary(value(formData, "finance_summary"));
  const parsedTravel = parseTravelSummary(value(formData, "travel_summary"));
  const checklist = buildChecklist(formData);

  const { error } = await supabaseAdmin
    .from("shows")
    .update({
      artist: value(formData, "artist"),
      program: value(formData, "program"),
      show_date: showDate,
      weekday: getWeekday(showDate),
      venue: value(formData, "venue"),
      city: value(formData, "city"),
      entry_time: value(formData, "entry_time"),
      start_time: value(formData, "start_time"),

      contact_name: value(formData, "contact_name"),
      contact_email: value(formData, "contact_email"),
      contact_phone: value(formData, "contact_phone"),
      venue_address: value(formData, "venue_address"),

      schedule: value(formData, "schedule"),
      technik: value(formData, "technik"),

      contract_status:
        parsedFinance.contract_status || value(formData, "contract_status"),
      fee: parsedFinance.fee || value(formData, "fee"),
      ticket_link: parsedFinance.ticket_link || value(formData, "ticket_link"),
      ticket_prices:
        parsedFinance.ticket_prices || value(formData, "ticket_prices"),
      capacity: parsedFinance.capacity || value(formData, "capacity"),
      free_tickets:
        parsedFinance.free_tickets || value(formData, "free_tickets"),
      invoice_email:
        parsedFinance.invoice_email || value(formData, "invoice_email"),
      invoice_address:
        parsedFinance.invoice_address || value(formData, "invoice_address"),
      contract_notes:
        parsedFinance.contract_notes || value(formData, "contract_notes"),

      billing_status: billingStatus,

      promotion: value(formData, "promotion"),

      anreise: parsedTravel.anreise || value(formData, "anreise"),
      unterkunft: parsedTravel.unterkunft || value(formData, "unterkunft"),
      catering_details:
        parsedTravel.catering_details || value(formData, "catering_details"),
      backstage_equipment:
        parsedTravel.backstage_equipment ||
        value(formData, "backstage_equipment"),

      general_notes: value(formData, "general_notes"),

      internal_status: internalStatus,
      next_step: value(formData, "next_step"),
      follow_up_date: value(formData, "follow_up_date"),
markus_included: formData.get("markus_included") === "on",
markus_notes: value(formData, "markus_notes"),
checklist,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/shows");
  revalidatePath("/markus");
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

function isPortalComplete(show: any) {
  const progress = getProgress(show);
  return progress.missing.length === 0;
}

function isPortalCompleteFromForm(formData: FormData) {
  const parsedFinance = parseFinanceSummary(value(formData, "finance_summary"));
  const parsedTravel = parseTravelSummary(value(formData, "travel_summary"));

  const required = [
    value(formData, "show_date"),
    value(formData, "venue"),
    value(formData, "city"),
    value(formData, "start_time"),
    value(formData, "contact_name"),
    value(formData, "contact_email"),
    value(formData, "venue_address"),
    value(formData, "technik"),
    parsedFinance.fee || value(formData, "fee"),
    parsedFinance.contract_status || value(formData, "contract_status"),
    parsedFinance.ticket_prices || value(formData, "ticket_prices"),
    parsedFinance.capacity || value(formData, "capacity"),
    parsedTravel.anreise || value(formData, "anreise"),
    parsedTravel.unterkunft || value(formData, "unterkunft"),
  ];

  return required.every(Boolean);
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
  if (item === "Formular vollständig") return isPortalComplete(show);
  if (item === "Vertrag geklärt") return isContractCleared(show);
  return !!show.checklist?.[item];
}

function getChecklistGroupProgress(show: any, items: string[]) {
  const done = items.filter((item) => isChecklistChecked(show, item)).length;

  return {
    done,
    total: items.length,
  };
}

function financeSummary(show: any) {
  return [
    show.contract_status && `Vertrag: ${show.contract_status}`,
    show.fee && `Honorar: ${show.fee}`,
    show.ticket_prices && `Eintrittspreise: ${show.ticket_prices}`,
    show.capacity && `Kapazität: ${show.capacity}`,
    show.free_tickets && `Freikarten: ${show.free_tickets}`,
    show.ticket_link && `Ticketlink: ${show.ticket_link}`,
    show.invoice_email && `Rechnungs-E-Mail: ${show.invoice_email}`,
    show.billing_status && `Abrechnung: ${billingLabel(show.billing_status)}`,
    show.invoice_address && `Rechnungsadresse: ${show.invoice_address}`,
    show.contract_notes && `Hinweise: ${show.contract_notes}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function travelSummary(show: any) {
  return [
    (show.anreise || show.travel_details) &&
      `Anreise: ${show.anreise || show.travel_details}`,
    (show.unterkunft || show.accommodation_notes) &&
      `Unterkunft: ${show.unterkunft || show.accommodation_notes}`,
    show.catering_details && `Catering: ${show.catering_details}`,
    show.backstage_equipment && `Backstage: ${show.backstage_equipment}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function parseFinanceSummary(text: string | null) {
  return parseSummary(text, {
    vertrag: "contract_status",
    honorar: "fee",
    eintrittspreise: "ticket_prices",
    preise: "ticket_prices",
    kapazität: "capacity",
    kapazitaet: "capacity",
    plätze: "capacity",
    plaetze: "capacity",
    freikarten: "free_tickets",
    ticketlink: "ticket_link",
    "rechnungs-e-mail": "invoice_email",
    rechnungsmail: "invoice_email",
    rechnungsadresse: "invoice_address",
    hinweise: "contract_notes",
  });
}

function parseTravelSummary(text: string | null) {
  return parseSummary(text, {
    anreise: "anreise",
    unterkunft: "unterkunft",
    hotel: "unterkunft",
    catering: "catering_details",
    backstage: "backstage_equipment",
  });
}

function parseSummary(text: string | null, map: Record<string, string>) {
  const result: Record<string, string> = {};
  if (!text) return result;

  for (const line of text.split("\n")) {
    const [rawKey, ...rest] = line.split(":");
    const rawValue = rest.join(":").trim();
    if (!rawKey || !rawValue) continue;

    const key = rawKey.trim().toLowerCase();
    const mapped = map[key];

    if (mapped) result[mapped] = rawValue;
  }

  return result;
}

function getProgress(show: any) {
  const fields = [
    ["Datum", show.show_date],
    ["Location", show.venue],
    ["Stadt", show.city],
    ["Beginn", show.start_time],
    ["Kontakt", show.contact_name],
    ["E-Mail", show.contact_email],
    ["Adresse", show.venue_address],
    ["Technik", show.technik],
    ["Honorar", show.fee],
    ["Vertragsstatus", show.contract_status],
    ["Eintrittspreise", show.ticket_prices],
    ["Kapazität", show.capacity],
    ["Anreise", show.anreise || show.travel_details],
    ["Unterkunft", show.unterkunft || show.accommodation_notes],
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

function billingLabel(value?: string | null) {
  const labels: Record<string, string> = {
    offen: "Offen",
    rechnung_zu_schreiben: "Rechnung zu schreiben",
    rechnung_verschickt: "Rechnung verschickt",
    bezahlt: "Bezahlt",
    nicht_relevant: "Nicht relevant",
  };

  return labels[value || ""] || value || "Offen";
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

      <div
        className={`grid gap-5 rounded-3xl border-2 border-dashed p-5 ${theme.shell}`}
      >
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

function Input({
  name,
  label,
  defaultValue,
  type = "text",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700">
      {label}
      <input
        name={name}
        type={type}
        defaultValue={defaultValue || ""}
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
  defaultValue?: string | null;
}) {
  return (
    <label className="grid gap-2 text-xs font-black text-zinc-700 md:col-span-2">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue || ""}
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
    "Kontakt vor Ort": "Wer ist vor Ort erreichbar?",
    Ablauf: "Alles rund um Timing und Ablauf.",
    Technik: "Technische Anforderungen und Hinweise.",
    "Vertrag & Finanzen": "Honorar, Tickets, Vertrag, Rechnung und Kapazität.",
    Promotion: "Werbung, Ticketlink und Material.",
    "Anreise, Hotel & Backstage":
      "Anreise, Unterkunft, Catering und Backstage.",
    "Vorbereitung & Nachbereitung": "Sonjas interne Checkliste.",
    Notizen: "Interne und allgemeine Hinweise.",
  };

  return descriptions[title] || "";
}

function value(formData: FormData, key: string) {
  const raw = formData.get(key);
  if (raw === null) return null;

  const stringValue = String(raw).trim();
  return stringValue === "" ? null : stringValue;
}

function getWeekday(date?: string | null) {
  if (!date) return null;

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;

  return d.toLocaleDateString("de-DE", { weekday: "long" }).toUpperCase();
}

function formatDate(date?: string | null) {
  if (!date) return "Datum offen";

  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;

  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateParts(date?: string | null) {
  if (!date) {
    return {
      day: "--",
      month: "---",
      year: "----",
    };
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
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