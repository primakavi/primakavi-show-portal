import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Fragment, type ReactNode } from "react";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

import CopyMailButtons from "./CopyMailButtons";
import FileUploadBox from "./FileUploadBox";

import StatusSelectCard from "./StatusSelectCard";
import QuickChecklistToggle from "./QuickChecklistToggle";
import CastEditor from "./CastEditor";
import PriceCategoryEditor from "./PriceCategoryEditor";
import TicketSalesEditor from "./TicketSalesEditor";
import InvoiceRecipientEditor from "./InvoiceRecipientEditor";
import PromoEditor from "./PromoEditor";
import TechEditor from "./TechEditor";
import BackstageEditor from "./BackstageEditor";
import AccommodationEditor from "./AccommodationEditor";
import PaymentEditor from "./PaymentEditor";
import TravelLegEditor from "./TravelLegEditor";
import TravelPlanningEditor from "./TravelPlanningEditor";
import Rating from "./Rating";
import CheckTile from "./CheckTile";
import FeeEditor from "./FeeEditor";
import FeeExtrasEditor from "./FeeExtrasEditor";
import ClickFeedbackButton from "./ClickFeedbackButton";
import RescheduleAwareSubmitButton from "./RescheduleAwareSubmitButton";
import LocationCombobox from "./LocationCombobox";
import VenueCapacityEditor from "./VenueCapacityEditor";
import SettlementEditor from "./SettlementEditor";
import ProgramEditor from "./ProgramEditor";

type AreaState = "open" | "done";

const CHECKLIST_BEFORE = [
  "Showdaten geprüft",
  "Vertrag geklärt",
  "Ticketlink vorhanden",
  "Ticketlink auf Homepage verlinkt",
  "Technik geklärt",
  "Ablauf geklärt",
  "Zugang zur Spielstätte geklärt",
  "Anreise / Unterkunft geklärt",
  "Backstage / Catering geklärt",
  "Besetzung vollständig",
  "Markus / Team informiert",
  "Promo erledigt",
  "GEMA geklärt",
] as const;

const CHECKLIST_AFTER = [
  "Rechnung verschickt",
  "Zahlung vollständig",
  "Show bewertet",
] as const;

const ALL_CHECKLIST = [
  ...CHECKLIST_BEFORE,
  ...CHECKLIST_AFTER,
] as const;

const MANUAL_CHECKLIST = new Set([
  "Showdaten geprüft",
  "Vertrag geklärt",
  "Ablauf geklärt",
  "Zugang zur Spielstätte geklärt",
  "Markus / Team informiert",
  "GEMA geklärt",
]);

export default async function ShowAkteV2Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; wvlSaved?: string }>;
}) {
  const { id } = await params;
  const { saved, wvlSaved } = await searchParams;

  const [
    showResult,
    venuesResult,
    organizersResult,
    economicsResult,
    castResult,
    travelResult,
    paymentsResult,
    ticketCategoriesResult,
    feeExtrasResult,
    manualTasksResult,
  ] = await Promise.all([
    supabaseAdmin
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
      .single(),

    supabaseAdmin
      .from("venues")
      .select(`
        id,
        name,
        street,
        postal_code,
        city,
        contact_name,
        contact_email,
        contact_phone,
        booking_email,
        capacity
      `)
      .order("name"),

    supabaseAdmin
      .from("organizers")
      .select(`
        id,
        name,
        city,
        email,
        phone,
        organizer_contacts (
          id,
          name,
          email,
          phone,
          is_primary
        )
      `)
      .order("name"),

    // WICHTIG: "*" statt nicht sicher vorhandener Spalten.
    // So bleiben bestehende Wirtschaftlichkeitsdatensätze sichtbar.
    supabaseAdmin
      .schema("booking")
      .from("show_economics")
      .select("*")
      .eq("show_id", id)
      .maybeSingle(),

    supabaseAdmin
      .schema("booking")
      .from("show_cast")
      .select("*")
      .eq("show_id", id)
      .order("sort_order"),

    supabaseAdmin
      .schema("booking")
      .from("show_travel_legs")
      .select("*")
      .eq("show_id", id)
      .order("direction")
      .order("sort_order"),

    supabaseAdmin
      .schema("booking")
      .from("show_payments")
      .select("*")
      .eq("show_id", id)
      .order("payment_date"),

    supabaseAdmin
      .schema("booking")
      .from("show_ticket_categories")
      .select("*")
      .eq("show_id", id)
      .order("sort_order"),

    supabaseAdmin
      .schema("booking")
      .from("show_fee_extras")
      .select("*")
      .eq("show_id", id)
      .order("sort_order"),

    supabaseAdmin
      .schema("booking")
      .from("show_tasks")
      .select("*")
      .eq("show_id", id)
      .eq("is_done", false)
      .order("follow_up_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),
  ]);

  const show = showResult.data;
  if (showResult.error || !show) notFound();

  const copySource = show.copy_setup_pending && show.copy_source_show_id
    ? (await supabaseAdmin.schema("booking").from("shows").select("id, venue, city, show_date").eq("id", show.copy_source_show_id).maybeSingle()).data
    : null;

  // Akquise-Ursprung der Show:
  // acquisition_id existiert bereits in booking.shows und wird beim
  // "Show aus Akquise erzeugen"-Workflow schon gesetzt.
  const [linkedAcquisitionResult, acquisitionCandidatesResult] = await Promise.all([
    show.acquisition_id
      ? supabaseAdmin
          .from("acquisition")
          .select(`
            id,
            venue_id,
            program,
            status,
            last_contact_at,
            created_at
          `)
          .eq("id", show.acquisition_id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    show.venue_id
      ? supabaseAdmin
          .from("acquisition")
          .select(`
            id,
            venue_id,
            program,
            status,
            last_contact_at,
            created_at
          `)
          .eq("venue_id", show.venue_id)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
  ]);

  const linkedAcquisition = linkedAcquisitionResult.data || null;
  const acquisitionCandidates = acquisitionCandidatesResult.data || [];

  const venues = venuesResult.data || [];
  const organizers = organizersResult.data || [];
  const economics = economicsResult.data || null;
  const rawCast = castResult.data || [];
  const travelLegs = travelResult.data || [];
  const payments = paymentsResult.data || [];
  const ticketCategories = ticketCategoriesResult.data || [];
  const feeExtras = feeExtrasResult.data || [];
  const manualTasks = manualTasksResult.data || [];
  const allowManualChecklist = ["gespielt", "abgeschlossen"].includes(
    String(show.internal_status || "")
  );

  const venue = venues.find((item: any) => item.id === show.venue_id) || null;
  const organizer =
    organizers.find((item: any) => item.id === show.organizer_id) || null;

  const contractPartnerName =
    organizer?.name || show.venue || venue?.name || "Vertragspartner offen";

  const venueName = show.venue || venue?.name || "Spielstätte offen";
  const venueAddress = show.venue_address || buildAddress(venue);

  const contractPartnerAddress = organizer
    ? organizer.city || ""
    : venueAddress;

  const primaryOrganizerContact = organizer?.organizer_contacts?.find(
    (contact: any) => contact.is_primary
  );

  const contractPartnerSummary = [
    contractPartnerName,
    organizer
      ? primaryOrganizerContact?.name || show.contact_name
      : show.contact_name,
    organizer
      ? primaryOrganizerContact?.email || organizer.email || show.invoice_email
      : show.invoice_email || show.contact_email,
  ]
    .filter(Boolean)
    .join(" · ");

  const venueSummary = [
    venueName,
    venueAddress,
    show.invoice_email || show.contact_email,
  ]
    .filter(Boolean)
    .join(" · ");

  // Altbestand: markus_included bleibt lesbar.
  // Falls in der neuen Besetzungstabelle noch kein Markus steht, wird er nur für V2 ergänzt.
  const castForEditor = [...rawCast];
  if (
    show.markus_included === true &&
    !castForEditor.some((person: any) =>
      /markus schell/i.test(String(person.name || ""))
    )
  ) {
    castForEditor.push({
      name: "Markus Schell",
      role: "Piano",
      sort_order: castForEditor.length,
    });
  }

  const hasMarkus =
    show.markus_included === true ||
    castForEditor.some((person: any) =>
      /markus schell/i.test(String(person.name || ""))
    );

  const castLabel = hasMarkus ? "🎹 Mit Markus Schell" : "Solo";

  const files = await Promise.all(
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

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";
  const portalUrl = host
    ? `${protocol}://${host}/show/${show.token}`
    : `/show/${show.token}`;

  const paid = payments.reduce(
    (sum: number, payment: any) => sum + Number(payment.amount || 0),
    0
  );
  const invoiceAmount = Number(show.invoice_amount || 0);

  const sellableCapacity = Number(
    show.sellable_capacity || show.capacity || 0
  );
  const ticketsSoldEntered =
    show.tickets_sold !== null &&
    show.tickets_sold !== undefined &&
    String(show.tickets_sold).trim() !== "";
  const ticketsSold = ticketsSoldEntered
    ? Number(show.tickets_sold)
    : null;
  const occupancy =
    ticketsSold !== null && sellableCapacity > 0
      ? Math.round((ticketsSold / sellableCapacity) * 100)
      : null;

  const sectionStates = getSectionStates({
    show,
    cast: castForEditor,
    travelLegs,
    ticketCategories,
  });

  const checklist = buildChecklistView({
    show,
    sectionStates,
    paid,
    invoiceAmount,
  });

  const hasAdditionalCast = castForEditor.some(
    (person: any) =>
      String(person?.name || "").trim() &&
      !/^sonja(?:\s+gründemann)?$/i.test(String(person?.name || "").trim())
  );
  const teamInfoRelevant = Boolean(show.markus_included) || hasAdditionalCast;
  const applicableChecklistBefore = CHECKLIST_BEFORE.filter(
    (label) => label !== "Markus / Team informiert" || teamInfoRelevant
  );

  const automaticShowFollowUpDate = defaultShowFollowUpDate(show.show_date);
  const effectiveShowFollowUpDate =
    show.show_follow_up_date || automaticShowFollowUpDate;

  // Produktionsrhythmus:
  // 90 Tage = Bearbeitung beginnt
  // 30 Tage = Produktionscheck
  // 7 Tage  = Finalcheck
  // fertig  = Spielbereit
  const showIsDeferred =
    isFutureDate(effectiveShowFollowUpDate) &&
    !isShowWithinDays(show.show_date, 7);

  const finalCheck = buildFinalCheck({
    show,
    sectionStates,
    checklistState: checklist.state,
  });

  const productionPhase = getProductionPhase({
    show,
    effectiveShowFollowUpDate,
    finalCheck,
  });

  const smartTasks = getSmartTasks({
    show,
    sectionStates,
    checklistState: checklist.state,
    files,
    travelLegs,
    economics,
    ticketsSoldEntered,
    showIsDeferred,
    finalCheck,
  });

  const economicsSummary = getEconomicsSummary(economics);

  // Nach der Show: erst komplett abgeschlossen, wenn die Nachbereitung
  // (inkl. Rechnung verschickt, Zahlung vollständig und Show bewertet)
  // UND die Wirtschaftlichkeit bewusst abgeschlossen wurden.
  const beforeShowChecklistComplete = applicableChecklistBefore.every(
    (label) => checklist.state[label] === true
  );
  const afterShowChecklistComplete = CHECKLIST_AFTER.every(
    (label) => checklist.state[label] === true
  );
  const worklistComplete =
    beforeShowChecklistComplete && afterShowChecklistComplete;
  const economicsComplete = Boolean(economics?.completed_at);
  const postRated = Boolean(
    show.review_audience &&
      show.review_location &&
      show.review_organization &&
      show.review_effort &&
      show.review_tech &&
      show.play_again
  );
  const ticketKnowledgeStatus =
    show.ticket_sales_knowledge_status ||
    (ticketsSoldEntered ? "known" : "open");
  const paymentComplete =
    show.billing_status === "nicht_relevant" ||
    (show.invoice_sent === true &&
      invoiceAmount > 0 &&
      paid >= invoiceAmount);

  const showFullyComplete =
    ["gespielt", "abgeschlossen"].includes(String(show.internal_status || "")) &&
    afterShowChecklistComplete &&
    economicsComplete;

  return (
    <main className="pb-32 text-zinc-950">
      <form id="show-main-form" action={saveShowV2Action}>
        <input type="hidden" name="id" value={show.id} />
        <input type="hidden" name="original_show_date" value={show.copy_setup_pending ? "" : (show.show_date || "")} />

        <div className="space-y-5 sm:space-y-6">

          {show.copy_setup_pending && (
            <div className="rounded-[1.4rem] bg-amber-50 p-4 ring-1 ring-amber-200">
              <div className="text-xs font-black uppercase tracking-[.14em] text-amber-700">Kopie · neue Show noch nicht eingerichtet</div>
              <div className="mt-1 text-sm font-black text-amber-950">Bitte neuen Termin und Besetzung festlegen.</div>
              {copySource && <div className="mt-1 text-xs font-semibold text-amber-800">Erstellt aus: {copySource.venue || "Show"}{copySource.city ? ` · ${copySource.city}` : ""}{copySource.show_date ? ` · ${formatDate(copySource.show_date)}` : ""}</div>}
              <div className="mt-2 text-[11px] font-semibold text-amber-700">Nach dem ersten Speichern mit neuem Datum verschwindet dieser Hinweis. Die neue Show ist dann vollständig eigenständig.</div>
            </div>
          )}

          {/* HEADER */}
          <header className="relative z-30 overflow-visible rounded-[1.55rem] bg-white shadow-sm ring-1 ring-black/5">
            <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
              <div className="px-6 py-6 sm:px-7">
                <p className="text-xs font-black uppercase tracking-[.18em] text-zinc-400">
                  Show-Akte
                </p>

                <h1 className="mt-2 max-w-5xl break-words text-3xl font-black tracking-tight sm:text-4xl">
                  {contractPartnerName}{show.copy_setup_pending ? " (Kopie)" : ""}
                </h1>

                <p className="mt-2 text-base font-black text-zinc-600">
                  {show.program || "Programm offen"}
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoLine
                    label="Vertragspartner"
                    value={contractPartnerName}
                    subline={contractPartnerAddress || undefined}
                  />
                  <InfoLine
                    label="Spielstätte"
                    value={venueName}
                    subline={venueAddress || undefined}
                  />
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fbf7ef] px-3 py-2 text-xs font-black text-zinc-800">
                    {castLabel}
                  </span>

                  {show.emergency_phone ? (
                    <a
                      href={`tel:${show.emergency_phone}`}
                      className="rounded-full bg-[#eef5ff] px-3 py-2 text-xs font-black text-[#2867d8]"
                    >
                      ☎ {show.contact_name || "Showtag-Kontakt"} ·{" "}
                      {show.emergency_phone}
                    </a>
                  ) : (
                    <span className="rounded-full bg-amber-50 px-3 py-2 text-xs font-black text-amber-700">
                      ☎ Showtag-Kontakt offen
                    </span>
                  )}

                  {!isPastShowDate(show.show_date) &&
                    !['gespielt', 'abgeschlossen', 'abgesagt'].includes(String(show.internal_status || '')) &&
                    effectiveShowFollowUpDate && (
                    <details className="group relative">
                      <summary
                        className={`list-none cursor-pointer rounded-full px-3 py-2 text-xs font-black ring-1 [&::-webkit-details-marker]:hidden ${productionPhase.className}`}
                      >
                        {productionPhase.label}
                      </summary>
                      <div className="absolute left-0 top-full z-[100] mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
                        <p className="text-sm font-black text-zinc-900">Produktionsstatus</p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
                          {productionPhase.description}
                        </p>

                        <label className="mt-3 grid gap-1.5 text-[11px] font-semibold text-zinc-500">
                          Bearbeitung beginnt am
                          <input
                            form="show-wvl-form"
                            name="show_follow_up_date"
                            type="date"
                            defaultValue={show.show_follow_up_date || automaticShowFollowUpDate || ""}
                            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
                          />
                        </label>

                        <p className="mt-2 text-[11px] font-bold text-zinc-400">
                          Automatisch: {formatDate(automaticShowFollowUpDate)}
                        </p>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="submit"
                            form="show-wvl-form"
                            formAction={saveShowFollowUpAction}
                            className="rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
                          >
                            WVL speichern
                          </button>
                          <button
                            type="submit"
                            form="show-wvl-form"
                            formAction={clearShowFollowUpAction}
                            className="rounded-full bg-white px-4 py-2 text-xs font-black text-zinc-600 ring-1 ring-black/10"
                          >
                            Automatik
                          </button>
                        </div>

                        <p className="mt-3 border-t border-zinc-100 pt-3 text-[11px] font-semibold leading-4 text-zinc-500">
                          ⓘ Rhythmus: 3 Monate Bearbeitungsstart · 30 Tage Produktionscheck · 7 Tage Finalcheck. Aufgaben mit eigener WVL bleiben unabhängig davon fällig.
                        </p>
                      </div>
                    </details>
                  )}

                  {(isPastShowDate(show.show_date) ||
                    ["gespielt", "abgeschlossen"].includes(
                      String(show.internal_status || "")
                    )) && (
                    <>
                      {showFullyComplete ? (
                        <span className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                          ✅ Show abgeschlossen
                        </span>
                      ) : (
                        <>
                          <span
                            className={`rounded-full px-3 py-2 text-xs font-black ring-1 ${
                              afterShowChecklistComplete
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-amber-50 text-amber-700 ring-amber-100"
                            }`}
                          >
                            {afterShowChecklistComplete
                              ? "✓ Nachbereitung erledigt"
                              : "🟠 Nachbereitung offen"}
                          </span>

                          <Link
                            href={`/admin/shows/${show.id}/economics`}
                            className={`rounded-full px-3 py-2 text-xs font-black ring-1 ${
                              economicsComplete
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-amber-50 text-amber-700 ring-amber-100"
                            }`}
                          >
                            {economicsComplete
                              ? "✓ Wirtschaftlichkeit erledigt"
                              : "💶 Wirtschaftlichkeit offen"}
                          </Link>
                        </>
                      )}
                    </>
                  )}

                  {linkedAcquisition ? (
                    <a
                      href={`/admin/acquisition/${linkedAcquisition.id}`}
                      className="rounded-full bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 ring-1 ring-violet-100 transition hover:bg-violet-100"
                      title="Akquise-Vorgang öffnen"
                    >
                      🎯 Aus Akquise: {linkedAcquisition.program || "Akquise"}
                    </a>
                  ) : acquisitionCandidates.length > 0 ? (
                    <details className="group relative">
                      <summary className="list-none cursor-pointer rounded-full bg-white px-3 py-2 text-xs font-black text-zinc-600 ring-1 ring-black/10 transition hover:bg-[#fbf7ef] [&::-webkit-details-marker]:hidden">
                        🎯 Akquise zuordnen
                      </summary>
                      <div className="absolute left-0 top-full z-[100] mt-2 w-[390px] max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
                        <p className="text-sm font-black text-zinc-900">
                          Aus welcher Akquise ist diese Show entstanden?
                        </p>
                        <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
                          Es werden nur Akquise-Vorgänge dieser Location angeboten.
                        </p>

                        <label className="mt-3 grid gap-1.5 text-[11px] font-semibold text-zinc-500">
                          Akquise-Vorgang
                          <select
                            form="show-acquisition-form"
                            name="acquisition_id"
                            defaultValue=""
                            className="h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-700 outline-none transition focus:border-zinc-400"
                          >
                            <option value="">Bitte auswählen</option>
                            {acquisitionCandidates.map((item: any) => (
                              <option key={item.id} value={item.id}>
                                {item.program || "Akquise"}
                                {item.status ? ` · ${item.status}` : ""}
                                {item.last_contact_at
                                  ? ` · ${formatDate(item.last_contact_at)}`
                                  : ""}
                              </option>
                            ))}
                          </select>
                        </label>

                        <button
                          type="submit"
                          form="show-acquisition-form"
                          formAction={saveShowAcquisitionAction}
                          className="mt-3 rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white"
                        >
                          Akquise verknüpfen
                        </button>
                      </div>
                    </details>
                  ) : (
                    <span
                      className="rounded-full bg-zinc-50 px-3 py-2 text-xs font-black text-zinc-400 ring-1 ring-black/5"
                      title="Für diese Location ist aktuell kein Akquise-Vorgang hinterlegt."
                    >
                      🎯 Keine Akquise zugeordnet
                    </span>
                  )}
                </div>
              </div>

              <div className="border-t border-black/5 bg-[#fffdf8] p-5 lg:border-l lg:border-t-0">
                <div className="grid h-full grid-cols-[105px_1fr] gap-5">
                  <div className="flex min-h-[145px] flex-col items-center justify-center rounded-[1.4rem] bg-[#fde8e7] px-3 py-4 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-500">
                      {show.weekday || "Datum"}
                    </p>
                    <p className="mt-1 text-4xl font-black">
                      {dateParts(show.show_date).day}
                    </p>
                    <p className="mt-2 text-sm font-black uppercase">
                      {dateParts(show.show_date).month}{" "}
                      {dateParts(show.show_date).year}
                    </p>

                    {show.rescheduled_from && (
                      <div className="mt-3 w-full border-t border-rose-200/70 pt-2">
                        <p className="text-[9px] font-black uppercase tracking-[.1em] text-amber-700">
                          🔄 Verschoben
                        </p>
                        <p className="mt-0.5 text-[10px] font-black text-zinc-600">
                          vom {formatDate(show.rescheduled_from)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-3 text-sm font-bold text-zinc-700">
                    <span>🕒 {formatTimeDisplay(show.start_time) || "Beginn offen"}</span>
                    <span>
                      🚪 Einlass{" "}
                      {formatTimeDisplay(show.entry_time) || "offen"}
                    </span>
                    <span>
                      🎟️{" "}
                      {show.capacity
                        ? `max. ${numericText(show.capacity)} Plätze`
                        : "Kapazität offen"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 STATUS-KACHELN */}
            <div className="border-t border-black/5 px-5 py-4 sm:px-6">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatusSelectCard
                  name="internal_status"
                  icon="🎟️"
                  tone="green"
                  defaultValue={show.internal_status}
                  options={[
                    ["option", "Option"],
                    ["fix", "Fix gebucht"],
                    ["gespielt", "Gespielt"],
                    ["abgeschlossen", "Abgeschlossen"],
                    ["abgesagt", "Abgesagt"],
                  ]}
                />

                <StatusSelectCard
                  name="work_status"
                  icon="✅"
                  tone="blue"
                  defaultValue={show.work_status}
                  options={[
                    ["offen", "Offen"],
                    ["wartet_auf_booking", "Wartet auf Booking"],
                    [
                      "wartet_auf_vertragspartner",
                      "Wartet auf Vertragspartner",
                    ],
                    ["wartet_auf_kuenstler", "Wartet auf Künstler:in"],
                    ["nichts_offen", "Nichts offen"],
                  ]}
                />

                <StatusSelectCard
                  name="contract_status"
                  icon="📝"
                  tone="yellow"
                  defaultValue={show.contract_status}
                  options={[
                    ["offen", "Vertrag offen"],
                    [
                      "wartet_auf_vertragspartner",
                      "Wartet auf Vertragspartner",
                    ],
                    ["wartet_auf_kuenstler", "Wartet auf Künstler:in"],
                    ["erledigt", "Vertrag erledigt"],
                    ["nicht_erforderlich", "Nicht erforderlich"],
                  ]}
                />

                <StatusSelectCard
                  name="billing_status"
                  icon="💶"
                  tone="red"
                  defaultValue={show.billing_status}
                  options={[
                    ["offen", "Abrechnung offen"],
                    ["rechnung_zu_schreiben", "Rechnung zu schreiben"],
                    ["rechnung_verschickt", "Rechnung verschickt"],
                    ["bezahlt", "Bezahlt"],
                    ["nicht_relevant", "Nicht relevant"],
                  ]}
                />
              </div>
            </div>
          </header>

          {/* COMMAND CENTER */}
          <section className="rounded-[1.55rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-xl font-black text-[#2867d8]">✓</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-black tracking-tight">Was ist jetzt zu tun?</h2>
                    <div className="max-w-2xl rounded-xl bg-[#f7faff] px-3.5 py-2 text-xs font-semibold leading-5 text-zinc-600 ring-1 ring-[#e6eefb]">
                      <span className="font-black text-[#2867d8]">ⓘ Tipp:</span>{" "}
                      Konkrete Aufgaben hier eintragen – z. B. „Nicole wegen Vertrag anrufen“.
                    </div>
                  </div>
                  <p className="mt-1 text-sm font-black text-zinc-600">
                    {workStatusTitle(show.work_status, show.internal_status, smartTasks.length + manualTasks.length)}
                  </p>

                  {manualTasks.length ? (
                    <div className="mt-3 space-y-2">
                      {manualTasks.map((task: any) => (
                        <div key={task.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-[#fbf7ef] px-3 py-2 ring-1 ring-black/5">
                          <span className="text-sm font-black text-zinc-900">○ {task.title}</span>
                          {task.follow_up_date && <span className="text-xs font-bold text-zinc-400">WVL {formatDate(task.follow_up_date)}</span>}
                          <div className="ml-auto flex items-center gap-2">
                            <details className="relative">
                              <summary className="cursor-pointer list-none text-[11px] font-black text-zinc-500 [&::-webkit-details-marker]:hidden">Bearbeiten</summary>
                              <div className="absolute right-0 z-30 mt-2 w-[min(520px,80vw)] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
                                <div className="grid gap-3 sm:grid-cols-[1fr_170px]">
                                  <Input name={`task_title_${task.id}`} label="Aufgabe" defaultValue={task.title} />
                                  <Input name={`task_date_${task.id}`} label="WVL" type="date" defaultValue={task.follow_up_date} />
                                </div>
                                <button formAction={updateManualTaskAction.bind(null, task.id)} className="mt-3 rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">Speichern</button>
                              </div>
                            </details>
                            <button formAction={completeManualTaskAction.bind(null, task.id)} className="text-[11px] font-black text-emerald-700">✓ Erledigt</button>
                            <button formAction={deleteManualTaskAction.bind(null, task.id)} className="text-[11px] font-black text-zinc-400">Löschen</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>

              <details className="group relative">
                <summary className="list-none cursor-pointer rounded-xl bg-white px-4 py-2.5 text-xs font-black text-zinc-700 ring-1 ring-black/10 transition hover:bg-[#fbf7ef] [&::-webkit-details-marker]:hidden">+ Aufgabe</summary>
                <div className="absolute right-0 z-20 mt-2 w-[min(560px,85vw)] rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/10">
                  <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
                    <Input name="new_task_title" label="Aufgabe" />
                    <Input name="new_task_date" label="Wiedervorlage" type="date" />
                  </div>
                  <button formAction={addManualTaskAction} className="mt-3 rounded-full bg-zinc-950 px-4 py-2 text-xs font-black text-white">Speichern</button>
                </div>
              </details>
            </div>

            <div className="mt-5 border-t border-black/5 pt-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-black">Offene Punkte</p>
                <a href="#arbeitsliste" className="text-xs font-black text-[#2867d8] hover:underline">Zur Arbeitsliste →</a>
              </div>
              <div className="mt-3 grid gap-x-8 gap-y-2 md:grid-cols-2">
                {smartTasks.map((task) => task.manual ? (
                  <QuickChecklistToggle key={task.label} targetId={checklistInputId(task.label)} initialChecked={checklist.state[task.label] === true} label={task.label} />
                ) : (
                  <a key={`${task.label}-${task.href}`} href={task.href} className="flex items-center gap-3 text-sm font-semibold text-zinc-700 transition hover:text-[#2867d8]">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-zinc-300 bg-white text-[9px]">○</span>
                    <span>{task.label}</span>
                    {task.followUpDate && <span className="ml-auto text-xs font-black text-amber-600">WVL {formatDate(task.followUpDate)}</span>}
                    <span className={task.followUpDate ? "text-zinc-300" : "ml-auto text-zinc-300"}>→</span>
                  </a>
                ))}
                {!smartTasks.length && <p className="text-sm font-black text-emerald-700">✓ Aktuell nichts automatisch offen.</p>}
              </div>
            </div>
          </section>

          {/* ARBEITSLISTE · kompakt direkt unter dem Command Center */}
          <details
            id="arbeitsliste"
            className="group scroll-mt-6 overflow-hidden rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5"
          >
            <summary className="list-none cursor-pointer px-4 py-3 transition hover:bg-[#fbfaf7] [&::-webkit-details-marker]:hidden">
              <div className="grid min-h-[46px] items-center gap-x-5 gap-y-1 md:grid-cols-[250px_minmax(0,1fr)_auto_26px]">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#eef4ff] text-[#2867d8]">
                    ☑
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
                      Checkliste
                    </p>
                    <h3 className="text-sm font-black text-zinc-950">
                      Sonjas Arbeitsliste
                    </h3>
                  </div>
                </div>

                <div className="min-w-0 text-xs font-semibold text-zinc-500">
                  {isPastShowDate(show.show_date) ||
                  ["gespielt", "abgeschlossen"].includes(String(show.internal_status || ""))
                    ? "Vorbereitung abgeschlossen · Nachbereitung im Blick"
                    : "Vorbereitung und operative Punkte im Blick"}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-black ring-1 ${
                    worklistComplete
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-amber-50 text-amber-700 ring-amber-100"
                  }`}
                >
                  {worklistComplete ? "✓ Aktuell erledigt" : "Offene Punkte"}
                </span>

                <span className="justify-self-end text-lg font-black text-zinc-500 transition group-open:rotate-90">
                  ›
                </span>
              </div>
            </summary>

            <div className="border-t border-black/5 bg-[#fffdf9] p-5 sm:p-6">
              <p className="mb-4 text-xs font-semibold text-zinc-400">
                ⓘ Einige Punkte werden automatisch aus der Show-Akte abgehakt.
              </p>

              {isPastShowDate(show.show_date) ||
              ["gespielt", "abgeschlossen"].includes(String(show.internal_status || "")) ? (
                <details className="group/old rounded-xl bg-white ring-1 ring-black/5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
                    <div>
                      <p className="text-sm font-black text-zinc-900">
                        ✓ Vorbereitung abgeschlossen
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-zinc-400">
                        Frühere Arbeitsliste anzeigen
                      </p>
                    </div>
                    <span className="text-sm font-black text-zinc-400 transition group-open/old:rotate-180">
                      ⌄
                    </span>
                  </summary>
                  <div className="border-t border-black/5 px-4 py-4">
                    <div className="grid gap-x-10 gap-y-2 md:grid-cols-2">
                      {applicableChecklistBefore.map((label) => (
                        <ChecklistRow
                          key={label}
                          label={label}
                          checked={checklist.state[label] === true}
                          manual={true}
                        />
                      ))}
                    </div>
                  </div>
                </details>
              ) : (
                <>
                  <h3 className="text-sm font-black text-zinc-900">Vor der Show</h3>
                  <div className="mt-3 grid gap-x-10 gap-y-2 md:grid-cols-2">
                    {applicableChecklistBefore.map((label) => (
                      <ChecklistRow
                        key={label}
                        label={label}
                        checked={checklist.state[label] === true}
                        manual={true}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="mt-5 border-t border-black/5 pt-5">
                <h3 className="text-sm font-black text-zinc-900">Nach der Show</h3>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {CHECKLIST_AFTER.map((label) => (
                    <ChecklistRow
                      key={label}
                      label={label}
                      checked={checklist.state[label] === true}
                      manual={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          </details>

          {finalCheck.visible && (
            <section id="finalcheck" className={`rounded-[1.55rem] p-5 shadow-sm ring-1 sm:p-6 ${finalCheck.ready ? "bg-emerald-50 ring-emerald-200" : "bg-[#fffaf0] ring-amber-200"}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[.14em] text-zinc-400">7 Tage vor der Show</p>
                  <h2 className="mt-1 text-xl font-black">🧭 Finalcheck · Sind wir wirklich spielbereit?</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-black ${finalCheck.ready ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {finalCheck.ready ? "✓ Spielbereit" : `${finalCheck.openCount} Punkte offen`}
                </span>
              </div>
              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {finalCheck.items.map((item: any) => (
                  <a key={item.label} href={item.href} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold ring-1 ${item.done ? "bg-white text-emerald-800 ring-emerald-100" : "bg-white text-zinc-700 ring-black/5 hover:text-[#2867d8]"}`}>
                    <span>{item.done ? "✓" : "○"}</span><span>{item.label}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ① VOR DER SHOW */}
          <PhaseHeader
            number="1"
            title="Vor der Show"
            subtitle="Alles, was vorher geklärt sein muss."
          />

          <div className="space-y-2">
            <FormSection
              id="showdaten"
              icon="🎭"
              title="Showdaten"
              state={sectionStates.showdata}
              preview={[show.program, venueName, venueAddress]}
            >
              <div className="grid gap-x-3 gap-y-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <div className="mb-1.5 flex min-h-[18px] items-center justify-between gap-3">
                    <span className="text-xs font-black text-zinc-500">Spielstätte</span>
                    {venue && (
                      <Link
                        href={`/admin/locations/${venue.id}`}
                        className="shrink-0 text-[11px] font-black text-[#2867d8] transition hover:underline"
                      >
                        Stammdaten öffnen →
                      </Link>
                    )}
                  </div>
                  <LocationCombobox
                    venues={venues}
                    defaultValue={show.venue_id}
                    hideLabel
                    hideHint
                  />
                </div>

                <VenueCapacityEditor
                  showCapacity={show.capacity}
                  venueCapacity={venue?.capacity}
                />

<label className="grid gap-1.5 text-xs font-black text-zinc-500">
  Programm / Format
  <ProgramEditor defaultValue={show.program} />
</label>
                <Input
                  name="show_date"
                  label="Datum"
                  type="date"
                  defaultValue={show.show_date}
                />
                <Input
                  name="start_time"
                  label="Showbeginn"
                  type="time"
                  defaultValue={normalizeTimeInput(show.start_time)}
                />

                {show.rescheduled_from && (
                  <div className="md:col-span-3 rounded-xl bg-amber-50 px-4 py-3 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                    🔄 Ursprünglicher Termin: {formatDate(show.rescheduled_from)}
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection
              id="vertragspartner"
              icon="🤝"
              title="Vertragspartner & Kontakt"
              state={sectionStates.contact}
              preview={[
                contractPartnerName,
                show.contact_name,
                show.contact_email,
              ]}
            >
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                <Select
                  name="organizer_id"
                  label="Vertragspartner"
                  defaultValue={show.organizer_id}
                  options={[
                    [
                      "",
                      "Kein separater Veranstalter – Spielstätte ist Vertragspartner",
                    ],
...organizers.map(
  (item: any) =>
    [
      item.id,
      `${item.name}${
        item.city ? ` · ${item.city}` : ""
      }`,
    ] as [string, string]
),
                  ]}
                />

                {organizer && (
                  <Link
                    href={`/admin/organizers/${organizer.id}`}
                    className="mb-0.5 rounded-xl bg-[#fbf7ef] px-4 py-3 text-xs font-black text-zinc-600 ring-1 ring-black/5 transition hover:text-zinc-950"
                  >
                    Stammdaten öffnen →
                  </Link>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  name="contact_name"
                  label="Ansprechpartner:in"
                  defaultValue={show.contact_name}
                />
                <Input
                  name="contact_email"
                  label="E-Mail"
                  defaultValue={show.contact_email}
                />
                <Input
                  name="contact_phone"
                  label="Telefon"
                  defaultValue={show.contact_phone}
                />
                <Input
                  name="emergency_phone"
                  label="Mobilnummer Veranstaltungstag"
                  defaultValue={show.emergency_phone}
                />
              </div>
            </FormSection>

            <FormSection
              id="vertrag-finanzen"
              icon="📝"
              title="Vertrag & Finanzen"
              state={sectionStates.contract}
              preview={[
                feePreview(show),
                ticketPricePreview(ticketCategories, show.ticket_prices),
              ]}
            >
              <div className="grid gap-3 lg:grid-cols-[1.15fr_1.25fr_.8fr]">
                <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                  <FieldLabel>Honorar & Konditionen</FieldLabel>
                  <FeeEditor show={show} />
                  {show.copy_setup_pending && show.fee_model && (
                    <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-bold text-amber-800 ring-1 ring-amber-200">
                      Aus vorheriger Show übernommen – bitte Konditionen für den neuen Termin prüfen.
                    </div>
                  )}
                  <FeeExtrasEditor initialExtras={feeExtras} />
                </div>

                <div className="rounded-xl bg-white p-3 ring-1 ring-black/5">
                  <FieldLabel>Eintrittspreise</FieldLabel>
                  <PriceCategoryEditor initialCategories={ticketCategories} />
                </div>

                <div className="space-y-3 rounded-xl bg-white p-3 ring-1 ring-black/5">
                  <Input
                    name="free_tickets"
                    label="Freikarten"
                    defaultValue={show.free_tickets}
                  />
                  <Select
                    name="contract_status"
                    label="Vertrag"
                    defaultValue={show.contract_status}
                    options={[
                      ["offen", "Vertrag offen"],
                      ["wartet_auf_vertragspartner", "Wartet auf Vertragspartner"],
                      ["wartet_auf_kuenstler", "Wartet auf Künstler:in"],
                      ["erledigt", "Vertrag erledigt"],
                      ["nicht_erforderlich", "Nicht erforderlich"],
                    ]}
                  />
                  <div className="pt-1 [&_a]:block [&_a]:max-w-full [&_a]:truncate">
                    <ContextFiles
                      title="Vertragsdateien"
                      files={files}
                      pattern={/vertrag|contract/i}
                    />
                  </div>
                </div>
              </div>

              <details
                open={show.invoice_recipient_source === "custom"}
                className="rounded-xl bg-[#fbf7ef] ring-1 ring-black/5"
              >
                <summary className="list-none cursor-pointer px-4 py-3 text-xs font-black text-zinc-700 [&::-webkit-details-marker]:hidden">
                  Rechnungsempfänger · {show.invoice_recipient_source === "custom" ? "abweichend" : "wie Vertragspartner"} →
                </summary>
                <div className="px-4 pb-4">
                  <InvoiceRecipientEditor
                    defaultSource={show.invoice_recipient_source || "contract_partner"}
                    contractPartnerSummary={contractPartnerSummary}
                    venueSummary={venueSummary}
                    values={show}
                  />
                </div>
              </details>

              <details
                open={Boolean(show.contract_notes)}
                className="rounded-xl bg-[#fbf7ef] ring-1 ring-black/5"
              >
                <summary className="list-none cursor-pointer px-4 py-3 text-xs font-black text-zinc-700 [&::-webkit-details-marker]:hidden">
                  {show.contract_notes
                    ? "Hinweise zu Vertrag / Rechnung"
                    : "+ Hinweis hinzufügen"}
                </summary>
                <div className="px-4 pb-4">
                  <CompactTextarea
                    name="contract_notes"
                    label=""
                    defaultValue={show.contract_notes}
                  />
                </div>
              </details>
            </FormSection>

            <FormSection
              id="besetzung"
              icon="👥"
              title="Besetzung"
              state={sectionStates.cast}
              preview={[
                castPreview(castForEditor),
                show.markus_notes ? "Info für Markus ✓" : null,
              ]}
            >
              <CastEditor initialCast={castForEditor} />

              {(hasMarkus || show.markus_notes) && (
                <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
                  <label
                    htmlFor="markus_notes"
                    className="mb-2 block text-xs font-black uppercase tracking-[.14em] text-zinc-500"
                  >
                    Info für Markus
                  </label>
                  <textarea
                    id="markus_notes"
                    name="markus_notes"
                    defaultValue={show.markus_notes || ""}
                    rows={3}
                    placeholder="z. B. Sonja + Requisiten um 14:30 Uhr abholen"
                    className="w-full resize-y rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 outline-none ring-1 ring-black/10 transition focus:ring-2 focus:ring-zinc-300"
                  />
                  <p className="mt-2 text-xs font-semibold text-zinc-500">
                    Operative Hinweise, die Markus für diese Show wissen muss.
                  </p>
                </div>
              )}

              <label className="flex min-h-11 items-center gap-3 rounded-xl bg-white px-4 text-sm font-black text-zinc-700 ring-1 ring-black/5">
                <input
                  type="checkbox"
                  name="cast_confirmed"
                  defaultChecked={show.cast_confirmed === true}
                  className="h-4 w-4"
                />
                Besetzung vollständig
              </label>
            </FormSection>

            <FormSection
              id="promo-ticketing"
              icon="📣"
              title="Promo & Ticketing"
              state={sectionStates.promo}
              preview={[
                show.ticket_link ? "Ticketlink ✓" : "Ticketlink offen",
                show.homepage_ticket_linked ? "Homepage ✓" : null,
                promoStatusPreview(show),
                show.flyer_amount
                  ? `Flyer ${show.flyer_amount}`
                  : null,
                posterPreview(show),
              ]}
            >
              <PromoEditor show={show} />
              <ContextFiles
                title="Promo-Dateien"
                files={files}
                pattern={/promo|flyer|plakat|poster/i}
              />
            </FormSection>

            <FormSection
              id="technik"
              icon="🎤"
              title="Technik & Bühne"
              state={sectionStates.tech}
              preview={techPreview(show)}
            >
              <TechEditor show={show} />
              <ContextFiles
                title="Technik-Dateien"
                files={files}
                pattern={/technik|tech|rider|bühne|stage/i}
              />
            </FormSection>

            <FormSection
              id="backstage"
              icon="☕"
              title="Backstage & Catering"
              state={sectionStates.backstage}
              preview={[
                backstagePreview(show),
                cateringPreview(show),
              ]}
            >
              <BackstageEditor show={show} />
            </FormSection>

            <FormSection
              id="anreise"
              icon="🧳"
              title="Anreise & Unterkunft"
              state={sectionStates.travel}
              preview={[
                travelPreview(travelLegs, show.travel_planning_status) || "Anreise noch offen",
                accommodationPreview(show),
              ]}
            >
              <SmallHeading>Anreise</SmallHeading>
              <TravelPlanningEditor
                initialStatus={show.travel_planning_status || "open"}
                initialLegs={travelLegs}
              />

              <SmallHeading>Unterkunft</SmallHeading>
              <AccommodationEditor show={show} />
            </FormSection>

            <FormSection
              id="ablauf"
              icon="🕒"
              title="Ablauf & Showtag"
              state={sectionStates.schedule}
              preview={[
                show.arrival_time
                  ? `Ankunft ${formatTimeDisplay(show.arrival_time)}`
                  : "Ankunft offen",
                show.setup_time
                  ? `Aufbau ${formatTimeDisplay(show.setup_time)}`
                  : "Aufbau offen",
                show.soundcheck_time
                  ? `Soundcheck ${formatTimeDisplay(show.soundcheck_time)}`
                  : "Soundcheck offen",
                show.entry_time
                  ? `Einlass ${formatTimeDisplay(show.entry_time)}`
                  : "Einlass offen",
                show.start_time
                  ? `Beginn ${formatTimeDisplay(show.start_time)}`
                  : null,
              ]}
            >
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  name="arrival_time"
                  label="Ankunft"
                  type="time"
                  defaultValue={normalizeTimeInput(show.arrival_time)}
                />
                <Input
                  name="setup_time"
                  label="Aufbau"
                  type="time"
                  defaultValue={normalizeTimeInput(show.setup_time)}
                />
                <Input
                  name="soundcheck_time"
                  label="Soundcheck"
                  type="time"
                  defaultValue={normalizeTimeInput(show.soundcheck_time)}
                />
                <Input
                  name="entry_time"
                  label="Einlass"
                  type="time"
                  defaultValue={normalizeTimeInput(show.entry_time)}
                />
              </div>

              <div className="border-t border-black/5 pt-3">
                <div className="grid gap-2 md:grid-cols-2">
                  <details className="group/access">
                    <summary className="list-none cursor-pointer rounded-lg px-1 py-1.5 text-xs font-black text-zinc-600 transition hover:text-zinc-950 [&::-webkit-details-marker]:hidden">
                      {show.venue_access_details
                        ? `📍 ${show.venue_access_details} · bearbeiten`
                        : "+ Zugang / Treffpunkt"}
                    </summary>
                    <div className="mt-2">
                      <CompactTextarea
                        name="venue_access_details"
                        label="Zugang / Treffpunkt vor Ort"
                        defaultValue={show.venue_access_details}
                      />
                    </div>
                  </details>

                  <details className="group/notes">
                    <summary className="list-none cursor-pointer rounded-lg px-1 py-1.5 text-xs font-black text-zinc-600 transition hover:text-zinc-950 [&::-webkit-details-marker]:hidden">
                      {show.schedule_notes
                        ? `⚡ ${show.schedule_notes} · bearbeiten`
                        : "+ Besonderheiten zum Ablauf"}
                    </summary>
                    <div className="mt-2">
                      <CompactTextarea
                        name="schedule_notes"
                        label="Besonderheiten zum Ablauf"
                        defaultValue={show.schedule_notes}
                      />
                    </div>
                  </details>
                </div>
              </div>
            </FormSection>
          </div>

          {/* ② SHOW */}
          <PhaseHeader
            number="2"
            title="Show"
            subtitle="Heute auf einen Blick."
          />

          <section className="rounded-[1.55rem] bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="overflow-x-auto">
              <div className="grid min-w-[720px] grid-cols-5 gap-2">
                <Timeline
                  label="Ankunft"
                  value={formatTimeDisplay(show.arrival_time)}
                />
                <Timeline
                  label="Aufbau"
                  value={formatTimeDisplay(show.setup_time)}
                />
                <Timeline
                  label="Soundcheck"
                  value={formatTimeDisplay(show.soundcheck_time)}
                />
                <Timeline
                  label="Einlass"
                  value={formatTimeDisplay(show.entry_time)}
                />
                <Timeline
                  label="SHOW"
                  value={formatTimeDisplay(show.start_time)}
                  strong
                />
              </div>
            </div>

            {(show.venue_access_details || show.schedule_notes) && (
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {show.venue_access_details && (
                  <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5">
                    <div className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
                      📍 Zugang & Treffpunkt
                    </div>
                    <div className="mt-1 whitespace-pre-line text-sm font-black text-zinc-800">
                      {show.venue_access_details}
                    </div>
                  </div>
                )}

                {show.schedule_notes && (
                  <div className="rounded-xl bg-[#fff8df] px-4 py-3 ring-1 ring-[#f0df9a]">
                    <div className="text-[10px] font-black uppercase tracking-[.12em] text-[#9a7a16]">
                      ⚡ Besonderheiten
                    </div>
                    <div className="mt-1 whitespace-pre-line text-sm font-black text-zinc-800">
                      {show.schedule_notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <ShowdayCard title="Menschen & Kontakte">
                <ShowdayLine
                  label="Besetzung"
                  value={showdayCastPreview(castForEditor)}
                />
                <ShowdayLine
                  label="Showtag"
                  value={show.contact_name || "offen"}
                  phone={show.emergency_phone}
                />
                <ShowdayLine
                  label="Technik"
                  value={show.tech_contact || "offen"}
                  phone={show.tech_phone}
                />
              </ShowdayCard>

              <ShowdayCard title="Vor Ort">
                <ShowdayLine
                  label="Backstage"
                  value={backstagePreview(show)}
                />
                <ShowdayLine
                  label="Catering"
                  value={cateringPreview(show)}
                />
                <ShowdayLine
                  label="Technik"
                  value={showdayTechPreview(show)}
                />
              </ShowdayCard>

              <ShowdayCard title="Anreise & Übernachtung">
                <ShowdayLine
                  label="Route"
                  value={travelPreview(travelLegs, show.travel_planning_status) || "noch offen"}
                />
                <ShowdayLine
                  label="Unterkunft"
                  value={accommodationPreview(show)}
                />
              </ShowdayCard>
            </div>
          </section>

          {/* ③ NACH DER SHOW */}
          <PhaseHeader
            number="3"
            title="Nach der Show"
            subtitle="Abrechnen, bewerten, abschließen."
          />

          <div className="space-y-2">
            <FormSection
              id="ticketzahlen"
              icon="🎟️"
              title="Ticketzahlen"
              state={ticketKnowledgeStatus !== "open" ? "done" : "open"}
              doneLabel="✓ Erfasst"
              preview={[
                ticketKnowledgeStatus === "unknown"
                  ? "Nicht weitergegeben"
                  : ticketsSoldEntered
                    ? `${ticketsSold} Tickets`
                    : "Noch offen",
                occupancy !== null ? `${occupancy} % Auslastung` : null,
                sellableCapacity ? `Kapazität ${sellableCapacity}` : null,
              ]}
            >
              <TicketSalesEditor
                initialMode={show.ticket_sales_mode}
                initialTotal={show.tickets_sold}
                initialCapacity={show.sellable_capacity || show.capacity}
                categories={ticketCategories}
              />

              <div className="mt-3 max-w-sm">
                <Select
                  name="ticket_sales_knowledge_status"
                  label="Ticketzahlen-Status"
                  defaultValue={ticketKnowledgeStatus}
                  options={[
                    ["open", "Noch offen"],
                    ["known", "Erfasst"],
                    ["unknown", "Nicht bekannt / Veranstalter meldet nicht"],
                  ]}
                />
              </div>
            </FormSection>

            <FormSection
              id="abrechnung"
              icon="🧾"
              title="Abrechnung"
              state={
                show.billing_status === "nicht_relevant" ||
                Number(show.settlement_total_amount || 0) > 0
                  ? "done"
                  : "open"
              }
              doneLabel="✓ Geklärt"
              preview={[
                show.billing_status === "nicht_relevant"
                  ? "Nicht relevant"
                  : show.settlement_total_amount
                    ? `${formatEuro(Number(show.settlement_total_amount))} Künstlerumsatz`
                    : "Abrechnung offen",
                show.fee_model ? `Modell: ${String(show.fee_model)}` : null,
              ]}
            >
              <SettlementEditor show={show} categories={ticketCategories} />
            </FormSection>

            <FormSection
              id="rechnung-zahlung"
              icon="💳"
              title="Rechnung & Zahlung"
              state={paymentComplete ? "done" : "open"}
              doneLabel="✓ Erledigt"
              preview={[
                show.invoice_sent ? "Rechnung verschickt" : "Rechnung offen",
                invoiceAmount > 0 ? formatEuro(invoiceAmount) : null,
                paymentComplete
                  ? "Zahlung vollständig"
                  : invoiceAmount > 0
                    ? `${formatEuro(Math.max(invoiceAmount - paid, 0))} offen`
                    : null,
              ]}
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <div className="self-end">
                  <CheckTile
                    name="invoice_sent"
                    label="Rechnung verschickt"
                    defaultChecked={show.invoice_sent === true}
                  />
                </div>

                <Input name="invoice_date" label="Rechnungsdatum" type="date" defaultValue={show.invoice_date} />
                <Input name="invoice_number" label="Rechnungsnummer" defaultValue={show.invoice_number} />
                <Input name="invoice_amount" label="Rechnungsbetrag €" type="number" defaultValue={show.invoice_amount} />
                <Input name="invoice_due_date" label="Fällig am" type="date" defaultValue={show.invoice_due_date} />
              </div>

              <ContextFiles
                title="Rechnungsdateien"
                files={files}
                pattern={/rechnung|invoice/i}
              />

              <PaymentEditor
                initialPayments={payments}
                invoiceAmount={show.invoice_amount}
                settlementAmount={show.settlement_total_amount}
              />
            </FormSection>

            <FormSection
              id="show-bewertung"
              icon="⭐"
              title="Show bewerten"
              state={postRated ? "done" : "open"}
              doneLabel="✓ Bewertet"
              preview={[
                show.play_again ? `Wieder spielen: ${playAgainLabel(show.play_again)}` : "Bewertung offen",
                show.show_learnings ? "Learnings erfasst" : null,
              ]}
            >
              <div className="grid gap-3 md:grid-cols-2">
                <Rating name="review_audience" label="Publikum" value={show.review_audience} options={[["hard", "😕 Schwierig"], ["okay", "🙂 Okay"], ["great", "😍 Super"]]} />
                <Rating name="review_location" label="Location" value={show.review_location} options={[["hard", "😕 Schwierig"], ["okay", "🙂 Okay"], ["great", "😍 Super"]]} />
                <Rating name="review_organization" label="Organisation" value={show.review_organization} options={[["hard", "😕 Schwierig"], ["okay", "🙂 Okay"], ["great", "😍 Super"]]} />
                <Rating name="review_effort" label="Aufwand" value={show.review_effort} options={[["low", "😌 Gering"], ["okay", "🙂 Okay"], ["high", "😵 Hoch"]]} />
                <Rating name="review_tech" label="Technik" value={show.review_tech} options={[["hard", "😕 Schwierig"], ["okay", "🙂 Okay"], ["great", "😍 Super"]]} />
                <Rating name="play_again" label="Würdest du hier wieder spielen?" value={show.play_again} options={[["yes", "😍 Ja"], ["maybe", "🤔 Vielleicht"], ["no", "👎 Nein"]]} />
              </div>

              <CompactTextarea
                name="show_learnings"
                label="Was lernen wir aus dieser Show?"
                defaultValue={show.show_learnings}
              />
            </FormSection>

            <FormSection
              id="wirtschaftlichkeit"
              icon="💸"
              title="Wirtschaftlichkeit"
              state={economicsComplete ? "done" : "open"}
              doneLabel="✓ Abgeschlossen"
              preview={
                economics
                  ? [
                      `${formatEuro(economicsSummary.revenue)} Einnahmen`,
                      `${formatEuro(economicsSummary.costs)} Kosten`,
                      `${formatEuro(economicsSummary.profit)} Ergebnis`,
                    ]
                  : ["Noch keine Auswertung"]
              }
            >
              {economics ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MiniMetric label="Einnahmen" value={formatEuro(economicsSummary.revenue)} />
                    <MiniMetric label="Kosten" value={formatEuro(economicsSummary.costs)} />
                    <MiniMetric label="Ergebnis" value={formatEuro(economicsSummary.profit)} />
                  </div>
                  {occupancy !== null && (
                    <p className="text-xs font-bold text-zinc-500">
                      Auslastung {occupancy} %
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm font-bold text-zinc-400">
                  Für diese Show liegt noch kein Wirtschaftlichkeitsdatensatz vor.
                </p>
              )}

              <Link
                href={`/admin/shows/${show.id}/economics`}
                className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-xs font-black text-zinc-700 ring-1 ring-black/10"
              >
                <span>Auswertung öffnen</span>
                <span>→</span>
              </Link>
            </FormSection>

            <FormSection
              id="show-abschluss"
              icon="🏁"
              title="Show abschließen"
              state={showFullyComplete ? "done" : "open"}
              doneLabel="✓ Show abgeschlossen"
              preview={[
                `${[
                  ticketKnowledgeStatus !== "open",
                  show.invoice_sent === true || show.billing_status === "nicht_relevant",
                  paymentComplete,
                  postRated,
                  economicsComplete,
                ].filter(Boolean).length}/5 Abschlusskriterien erfüllt`,
              ]}
            >
              <div className="grid gap-2 md:grid-cols-2">
                <CompletionLine label="Ticketzahlen erfasst / nicht weitergegeben" done={ticketKnowledgeStatus !== "open"} />
                <CompletionLine label="Rechnung verschickt / nicht relevant" done={show.invoice_sent === true || show.billing_status === "nicht_relevant"} />
                <CompletionLine label="Zahlung vollständig" done={paymentComplete} />
                <CompletionLine label="Show bewertet" done={postRated} />
                <CompletionLine label="Wirtschaftlichkeit abgeschlossen" done={economicsComplete} />
              </div>

              <p className={`rounded-xl px-4 py-3 text-sm font-black ${
                showFullyComplete
                  ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                  : "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
              }`}>
                {showFullyComplete
                  ? "✓ Diese Show ist vollständig abgeschlossen."
                  : "Die Show ist abgeschlossen, sobald alle fünf Kriterien erfüllt sind."}
              </p>
            </FormSection>
          </div>

          {/* WERKZEUGE */}
          <section className="grid items-stretch gap-4 xl:grid-cols-2">
            <BottomCard title="📨 Veranstalter-Portal">
              <p className="text-sm font-bold text-zinc-500">
                Formular vollständig · {portalProgress(show).done}/
                {portalProgress(show).total} Angaben
              </p>

              <div className="mt-4">
                <a
                  href={`/show/${show.token}`}
                  target="_blank"
                  className="flex items-center justify-between rounded-xl bg-[#fbf7ef] px-4 py-3 text-xs font-black text-zinc-700 ring-1 ring-black/5"
                >
                  <span>Formular öffnen</span>
                  <span>→</span>
                </a>
              </div>

              <div className="mt-2 [&>div]:!gap-3 [&_button]:!min-h-10 [&_button]:!rounded-xl [&_button]:!bg-none [&_button]:!bg-[#fbf7ef] [&_button]:!px-4 [&_button]:!py-2.5 [&_button]:!text-xs [&_button]:!font-black [&_button]:!text-zinc-700 [&_button]:!shadow-none">
                <CopyMailButtons show={show} portalUrl={portalUrl} />
              </div>
            </BottomCard>

            <BottomCard title="📁 Dateien">
              <FileUploadBox token={show.token} />

              <div className="mt-3 space-y-2">
                {files.length ? (
                  files.slice(0, 5).map((file: any) =>
                    file.url ? (
                      <a
                        key={file.id}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl bg-[#fbf7ef] px-4 py-3 text-xs font-black text-zinc-700 ring-1 ring-black/5"
                      >
                        <span className="min-w-0 truncate">
                          {file.file_name || "Datei"}
                        </span>
                        <span className="ml-3">→</span>
                      </a>
                    ) : null
                  )
                ) : (
                  <p className="text-sm font-bold text-zinc-400">
                    Noch keine Dateien hochgeladen.
                  </p>
                )}
              </div>
            </BottomCard>


          </section>
        </div>

        <div className="fixed bottom-5 left-[calc(260px+2rem)] right-8 z-30 rounded-[1.5rem] bg-zinc-950 p-3 text-white shadow-2xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">
                {saved ? "✓ Gespeichert" : "Show-Akte"}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-zinc-400">
                Änderungen werden direkt in der Show-Akte gespeichert.
              </p>
            </div>

            <RescheduleAwareSubmitButton
              formId="show-main-form"
              originalDate={show.show_date || ""}
              idleLabel="Speichern →"
              savingLabel="Wird gespeichert …"
              className="rounded-full bg-[#dff66d] px-6 py-3 text-sm font-black text-zinc-950 transition hover:scale-[1.01]"
            />
          </div>
        </div>
      </form>

      {/* Eigene Form für die Show-WVL. Die Controls im Header gehören über form="show-wvl-form"
          ausschließlich zu dieser Form und nicht zum großen Show-Akten-Formular. */}
      <form id="show-wvl-form" className="hidden">
        <input type="hidden" name="id" value={show.id} />
      </form>

      <form id="show-acquisition-form" className="hidden">
        <input type="hidden" name="id" value={show.id} />
      </form>
    </main>
  );
}

async function addManualTaskAction(formData: FormData) {
  "use server";
  const showId = str(formData.get("id"));
  const title = str(formData.get("new_task_title")).trim();
  if (!showId || !title) return;
  const result = await supabaseAdmin.schema("booking").from("show_tasks").insert({ show_id: showId, title, follow_up_date: nullable(formData.get("new_task_date")), is_done: false });
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${showId}`);
}

async function updateManualTaskAction(taskId: string, formData: FormData) {
  "use server";
  const showId = str(formData.get("id"));
  const title = str(formData.get(`task_title_${taskId}`)).trim();
  if (!showId || !taskId || !title) return;
  const result = await supabaseAdmin.schema("booking").from("show_tasks").update({ title, follow_up_date: nullable(formData.get(`task_date_${taskId}`)), updated_at: new Date().toISOString() }).eq("id", taskId).eq("show_id", showId);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${showId}`);
}

async function completeManualTaskAction(taskId: string, formData: FormData) {
  "use server";
  const showId = str(formData.get("id"));
  if (!showId || !taskId) return;
  const result = await supabaseAdmin.schema("booking").from("show_tasks").update({ is_done: true, completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", taskId).eq("show_id", showId);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${showId}`);
}

async function deleteManualTaskAction(taskId: string, formData: FormData) {
  "use server";
  const showId = str(formData.get("id"));
  if (!showId || !taskId) return;
  const result = await supabaseAdmin.schema("booking").from("show_tasks").delete().eq("id", taskId).eq("show_id", showId);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${showId}`);
}

async function saveShowFollowUpAction(formData: FormData) {
  "use server";
  const id = str(formData.get("id"));
  if (!id) return;
  const value = nullable(formData.get("show_follow_up_date"));
  const result = await supabaseAdmin.schema("booking").from("shows").update({ show_follow_up_date: value }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin/shows");
  redirect(`/admin/shows/${id}?wvlSaved=${Date.now()}`);
}

async function clearShowFollowUpAction(formData: FormData) {
  "use server";
  const id = str(formData.get("id"));
  if (!id) return;
  const result = await supabaseAdmin.schema("booking").from("shows").update({ show_follow_up_date: null }).eq("id", id);
  if (result.error) throw new Error(result.error.message);
  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin/shows");
  redirect(`/admin/shows/${id}?wvlSaved=${Date.now()}`);
}

async function saveShowAcquisitionAction(formData: FormData) {
  "use server";

  const showId = str(formData.get("id"));
  const acquisitionId = nullable(formData.get("acquisition_id"));

  if (!showId || !acquisitionId) return;

  const { data: show, error: showError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id, venue_id")
    .eq("id", showId)
    .single();

  if (showError || !show) {
    throw new Error(showError?.message || "Show konnte nicht geladen werden.");
  }

  const { data: acquisition, error: acquisitionError } = await supabaseAdmin
    .from("acquisition")
    .select("id, venue_id")
    .eq("id", acquisitionId)
    .single();

  if (acquisitionError || !acquisition) {
    throw new Error(
      acquisitionError?.message || "Akquise konnte nicht geladen werden."
    );
  }

  if (
    show.venue_id &&
    acquisition.venue_id &&
    show.venue_id !== acquisition.venue_id
  ) {
    throw new Error("Diese Akquise gehört zu einer anderen Location.");
  }

  const { data: alreadyLinked } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select("id")
    .eq("acquisition_id", acquisitionId)
    .neq("id", showId)
    .maybeSingle();

  if (alreadyLinked) {
    throw new Error("Diese Akquise ist bereits mit einer anderen Show verknüpft.");
  }

  const { error } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({ acquisition_id: acquisitionId })
    .eq("id", showId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/shows/${showId}`);
  revalidatePath("/admin/shows");
  revalidatePath(`/admin/acquisition/${acquisitionId}`);
  redirect(`/admin/shows/${showId}?saved=acquisition-${Date.now()}`);
}

/* ============================================================
   SAVE
   ============================================================ */

async function saveShowV2Action(formData: FormData) {
  "use server";

  const id = str(formData.get("id"));
  if (!id) return;

  const { data: current, error: currentError } = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .select(`
      venue_id,
      organizer_id,
      venue,
      city,
      venue_address,
      capacity,
      contact_name,
      contact_email,
      contact_phone,
      fee,
      internal_status,
      follow_up_date,
      show_follow_up_date,
      travel_planning_status,
      rescheduled_from,
      checklist,
      copy_setup_pending,
      copy_source_show_id
    `)
    .eq("id", id)
    .single();

  if (currentError || !current) {
    throw new Error(
      currentError?.message || "Show konnte nicht geladen werden."
    );
  }

  const venueId = nullable(formData.get("venue_id"));
  const organizerId = nullable(formData.get("organizer_id"));

  const venueChanged = venueId !== (current.venue_id || null);
  const organizerChanged =
    organizerId !== (current.organizer_id || null);

  let venue: any = null;
  if (venueId) {
    const result = await supabaseAdmin
      .from("venues")
      .select(`
        id,
        name,
        street,
        postal_code,
        city,
        contact_name,
        contact_email,
        contact_phone,
        booking_email,
        capacity
      `)
      .eq("id", venueId)
      .single();

    if (result.error) throw new Error(result.error.message);
    venue = result.data;
  }

  let organizer: any = null;
  if (organizerId) {
    const result = await supabaseAdmin
      .from("organizers")
      .select(`
        id,
        name,
        email,
        phone,
        city,
        organizer_contacts (
          id,
          name,
          email,
          phone,
          is_primary
        )
      `)
      .eq("id", organizerId)
      .single();

    if (result.error) throw new Error(result.error.message);
    organizer = result.data;
  }

  const primary = organizer?.organizer_contacts?.find(
    (contact: any) => contact.is_primary
  );

  const fallbackName = organizerId
    ? primary?.name || null
    : venue?.contact_name || null;

  const fallbackEmail = organizerId
    ? primary?.email || organizer?.email || null
    : venue?.contact_email || venue?.booking_email || null;

  const fallbackPhone = organizerId
    ? primary?.phone || organizer?.phone || null
    : venue?.contact_phone || null;

  const venueAddress = venue ? buildAddress(venue) : null;
  const showDate = nullable(formData.get("show_date"));
  const originalShowDate = nullable(formData.get("original_show_date"));
  const dateChangeKind = nullable(formData.get("date_change_kind"));
  const showDateChanged = Boolean(
    showDate && originalShowDate && showDate !== originalShowDate
  );

  let rescheduledFrom = current.rescheduled_from || null;
  if (showDateChanged && dateChangeKind === "reschedule" && !rescheduledFrom) {
    rescheduledFrom = originalShowDate;
  }

  const existingChecklist = {
    ...(current.checklist || {}),
  };

  const rawSubmittedInternalStatus = last(formData, "internal_status");
  const validInternalStatuses = new Set(["option", "fix", "gespielt", "abgeschlossen", "abgesagt"]);
  let submittedInternalStatus = validInternalStatuses.has(String(rawSubmittedInternalStatus || ""))
    ? String(rawSubmittedInternalStatus)
    : String(current.internal_status || "option");

  // Failsafe: Eine bereits echte Buchung darf durch einen normalen Akten-Save
  // niemals unbemerkt wieder zur Option werden.
  if (String(current.internal_status || "") !== "option" && submittedInternalStatus === "option") {
    submittedInternalStatus = String(current.internal_status || "fix");
  }

  // Show-WVL ist bewusst getrennt vom alten follow_up_date.
  // Das alte Feld kann historische/andere Wiedervorlagen enthalten und bleibt unangetastet.
  const submittedShowFollowUpDate = formData.has("show_follow_up_date")
    ? nullable(formData.get("show_follow_up_date"))
    : current.show_follow_up_date;

  const allowManualChecklist = ["gespielt", "abgeschlossen"].includes(
    String(submittedInternalStatus || "")
  );

  const checklistKeysToSave = allowManualChecklist
    ? ALL_CHECKLIST
    : Array.from(MANUAL_CHECKLIST);

  for (const key of checklistKeysToSave) {
    existingChecklist[key] =
      formData.get(`checklist_${key}`) === "on";
  }

  const patch: Record<string, any> = {
    venue_id: venueId,
    organizer_id: organizerId,

    program: nullable(formData.get("program")),
    show_date: showDate,
    weekday: weekday(showDate),
    rescheduled_from: rescheduledFrom,
    start_time: normalizeTimeForDb(
      nullable(formData.get("start_time"))
    ),
    capacity: intOrNull(formData.get("capacity")),

    venue: venueChanged
      ? venue?.name || current.venue
      : current.venue,

    city: venueChanged
      ? venue?.city || current.city
      : current.city,

    venue_address: venueChanged
      ? venueAddress || current.venue_address
      : current.venue_address,

    contact_name:
      nullable(formData.get("contact_name")) ||
      ((venueChanged || organizerChanged)
        ? fallbackName
        : current.contact_name),

    contact_email:
      nullable(formData.get("contact_email")) ||
      ((venueChanged || organizerChanged)
        ? fallbackEmail
        : current.contact_email),

    contact_phone:
      nullable(formData.get("contact_phone")) ||
      ((venueChanged || organizerChanged)
        ? fallbackPhone
        : current.contact_phone),

    emergency_phone: nullable(
      formData.get("emergency_phone")
    ),

    // Das alte Freitext-Honorar bleibt als historischer Snapshot erhalten,
    // solange kein altes "fee"-Feld explizit mitgesendet wird.
    fee: formData.has("fee")
      ? nullable(formData.get("fee"))
      : current.fee,

    fee_model: nullable(formData.get("fee_model")),
    fee_base_amount: numOrNull(formData.get("fee_base_amount")),
    fee_artist_share: numOrNull(formData.get("fee_artist_share")),
    fee_organizer_share: numOrNull(formData.get("fee_organizer_share")),
    fee_tax_mode: nullable(formData.get("fee_tax_mode")),
    fee_notes: nullable(formData.get("fee_notes")),
    fee_combination_mode: nullable(formData.get("fee_combination_mode")),
    fee_share_threshold: numOrNull(formData.get("fee_share_threshold")),

    free_tickets: nullable(formData.get("free_tickets")),

    invoice_recipient_source: nullable(
      formData.get("invoice_recipient_source")
    ),
    invoice_recipient_company: nullable(
      formData.get("invoice_recipient_company")
    ),
    invoice_recipient_contact: nullable(
      formData.get("invoice_recipient_contact")
    ),
    invoice_recipient_street: nullable(
      formData.get("invoice_recipient_street")
    ),
    invoice_recipient_postal_code: nullable(
      formData.get("invoice_recipient_postal_code")
    ),
    invoice_recipient_city: nullable(
      formData.get("invoice_recipient_city")
    ),
    invoice_recipient_country: nullable(
      formData.get("invoice_recipient_country")
    ),
    invoice_email: nullable(formData.get("invoice_email")),
    po_number: nullable(formData.get("po_number")),
    contract_notes: nullable(formData.get("contract_notes")),

    cast_confirmed:
      formData.get("cast_confirmed") === "on",
    markus_notes: nullable(formData.get("markus_notes")),

    ticket_link: nullable(formData.get("ticket_link")),
    homepage_ticket_linked:
      formData.get("homepage_ticket_linked") === "on",
    flyers_needed: nullable(formData.get("flyers_needed")),
    flyer_amount: nullable(formData.get("flyer_amount")),
    posters_needed: nullable(formData.get("posters_needed")),
    // Legacy-Felder bleiben als Snapshot erhalten; neue Mehrformat-Logik liegt in promo_poster_sizes.
    poster_amount_text: nullable(formData.get("poster_amount_text")),
    poster_format: nullable(formData.get("poster_format")),
    poster_format_other: nullable(formData.get("poster_format_other")),
    promo_poster_sizes: parseJsonArray(formData.get("promo_poster_sizes_json")),
    promo_print_cost: numOrNull(formData.get("promo_print_cost")),
    promo_shipping_cost: numOrNull(formData.get("promo_shipping_cost")),
    promo_sent_at: nullable(formData.get("promo_sent_at")),
    promo_send_status: nullable(formData.get("promo_sent_at"))
      ? "sent"
      : (nullable(formData.get("promo_follow_up_date")) ? "follow_up" : "open"),
    promo_follow_up_date: nullable(formData.get("promo_follow_up_date")),
    promotion: nullable(formData.get("promotion")),

    tech_sound_status: nullable(
      formData.get("tech_sound_status")
    ),
    tech_lights_status: nullable(
      formData.get("tech_lights_status")
    ),
    tech_piano_status: nullable(
      formData.get("tech_piano_status")
    ),
    tech_piano_model: nullable(
      formData.get("tech_piano_model")
    ),
    epiano_status: nullable(formData.get("epiano_status")),
    tech_epiano_model: nullable(
      formData.get("tech_epiano_model")
    ),
    tech_contact: nullable(formData.get("tech_contact")),
    tech_phone: nullable(formData.get("tech_phone")),
    tech_notes: nullable(formData.get("tech_notes")),

    backstage_status: nullable(
      formData.get("backstage_status")
    ),
    backstage_mirror_status: nullable(
      formData.get("backstage_mirror_status")
    ),
    backstage_seating_status: nullable(
      formData.get("backstage_seating_status")
    ),
    backstage_table_status: nullable(
      formData.get("backstage_table_status")
    ),
    catering_structured_status: nullable(
      formData.get("catering_structured_status")
    ),
    catering_details: nullable(
      formData.get("catering_details")
    ),
    backstage_notes: nullable(
      formData.get("backstage_notes")
    ),

    travel_planning_status:
      nullable(formData.get("travel_planning_status")) ||
      current.travel_planning_status ||
      "open",

    accommodation_status: nullable(
      formData.get("accommodation_status")
    ),
    accommodation_buyout: nullable(
      formData.get("accommodation_buyout")
    ),
    accommodation_hotel_name: nullable(
      formData.get("accommodation_hotel_name")
    ),
    accommodation_address: nullable(
      formData.get("accommodation_address")
    ),
    accommodation_checkin: nullable(
      formData.get("accommodation_checkin")
    ),
    accommodation_checkout: nullable(
      formData.get("accommodation_checkout")
    ),
    accommodation_booking_ref: nullable(
      formData.get("accommodation_booking_ref")
    ),
    accommodation_booked:
      formData.get("accommodation_booked") === "on",
    accommodation_actual_cost: numOrNull(
      formData.get("accommodation_actual_cost")
    ),
    accommodation_notes: nullable(
      formData.get("accommodation_notes")
    ),

    arrival_time: normalizeTimeForDb(
      nullable(formData.get("arrival_time"))
    ),
    setup_time: normalizeTimeForDb(
      nullable(formData.get("setup_time"))
    ),
    soundcheck_time: normalizeTimeForDb(
      nullable(formData.get("soundcheck_time"))
    ),
    entry_time: normalizeTimeForDb(
      nullable(formData.get("entry_time"))
    ),
    venue_access_details: nullable(
      formData.get("venue_access_details")
    ),
    schedule_notes: nullable(formData.get("schedule_notes")),

    settlement_method: nullable(formData.get("settlement_method")),
    settlement_share_amount: numOrNull(formData.get("settlement_share_amount")),
    settlement_total_amount: numOrNull(formData.get("settlement_total_amount")),
    settlement_confirmed: formData.get("settlement_confirmed") === "1",

    invoice_sent: formData.get("invoice_sent") === "on",
    invoice_date: nullable(formData.get("invoice_date")),
    invoice_number: nullable(
      formData.get("invoice_number")
    ),
    invoice_amount: numOrNull(
      formData.get("invoice_amount")
    ),
    invoice_due_date: nullable(
      formData.get("invoice_due_date")
    ),

    ticket_sales_mode:
      nullable(formData.get("ticket_sales_mode")) || "total",
    tickets_sold: intOrNull(formData.get("tickets_sold")),
    sellable_capacity: intOrNull(
      formData.get("sellable_capacity")
    ),

    review_audience: nullable(
      formData.get("review_audience")
    ),
    review_location: nullable(
      formData.get("review_location")
    ),
    review_organization: nullable(
      formData.get("review_organization")
    ),
    review_effort: nullable(
      formData.get("review_effort")
    ),
    review_tech: nullable(formData.get("review_tech")),
    play_again: nullable(formData.get("play_again")),
    show_learnings: nullable(
      formData.get("show_learnings")
    ),

    internal_status: submittedInternalStatus,
    work_status: last(formData, "work_status"),
    contract_status: last(formData, "contract_status"),
    billing_status: last(formData, "billing_status"),
    ticket_sales_knowledge_status: nullable(
      formData.get("ticket_sales_knowledge_status")
    ),
    show_follow_up_date: ["gespielt", "abgeschlossen", "abgesagt"].includes(String(submittedInternalStatus || ""))
      ? current.show_follow_up_date
      : submittedShowFollowUpDate,

    checklist: existingChecklist,
    copy_setup_pending: current.copy_setup_pending ? !Boolean(showDate) : false,
    copy_source_show_id: current.copy_setup_pending && showDate ? null : current.copy_source_show_id,
  };

  const updateResult = await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update(patch)
    .eq("id", id);

  if (updateResult.error) {
    throw new Error(updateResult.error.message);
  }

  if (venueId && formData.get("capacity_update_scope") === "venue") {
    const capacity = intOrNull(formData.get("capacity"));
    if (capacity !== null) {
      const venueUpdate = await supabaseAdmin.from("venues").update({ capacity }).eq("id", venueId);
      if (venueUpdate.error) throw new Error(venueUpdate.error.message);
    }
  }

  const castRows = parseJsonArray(
    formData.get("show_cast_json")
  );
  await replaceCast(id, castRows);

  const travelRows = parseJsonArray(
    formData.get("travel_legs_json")
  );
  await replaceTravel(id, travelRows);

  const paymentRows = parseJsonArray(
    formData.get("payments_json")
  );
  await replacePayments(id, paymentRows);

  const feeExtraRows = parseJsonArray(
    formData.get("fee_extras_json")
  );
  await replaceFeeExtras(id, feeExtraRows);

  const categoryRows = parseJsonArray(
    formData.get("ticket_categories_json")
  );
  const salesRows = parseJsonArray(
    formData.get("ticket_sales_json")
  );
  await replaceTicketCategories(id, categoryRows, salesRows);

  const markusIncluded = castRows.some((row: any) =>
    /markus schell/i.test(String(row.name || ""))
  );

  await supabaseAdmin
    .schema("booking")
    .from("shows")
    .update({ markus_included: markusIncluded })
    .eq("id", id);

  await syncSettlementToEconomics(id, patch.settlement_total_amount, patch.settlement_confirmed);

  revalidatePath(`/admin/shows/${id}/v2`);
  revalidatePath(`/admin/shows/${id}`);
  revalidatePath("/admin/shows");

  redirect(`/admin/shows/${id}?saved=${Date.now()}`);
}

async function syncSettlementToEconomics(showId: string, settlementTotal: number | null, confirmed: boolean) {
  if (!confirmed || settlementTotal === null) return;
  const { data: existing, error } = await supabaseAdmin.schema("booking").from("show_economics").select("*").eq("show_id", showId).maybeSingle();
  if (error) throw new Error(error.message);
  const revenueItems = Array.isArray(existing?.revenue_items) ? existing.revenue_items : [];
  const extraRevenue = revenueItems.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  const costItems = Array.isArray(existing?.cost_items) ? existing.cost_items : [];
  const storedCosts = costItems.reduce((sum: number, item: any) => sum + (Number(item?.amount) || 0), 0);
  const revenueTotal = settlementTotal + extraRevenue;
  const payload: any = { show_id: showId, revenue_total: revenueTotal, revenue_type: "show_settlement", revenue_items: revenueItems, profit: revenueTotal - storedCosts };
  const result = existing
    ? await supabaseAdmin.schema("booking").from("show_economics").update(payload).eq("show_id", showId)
    : await supabaseAdmin.schema("booking").from("show_economics").insert(payload);
  if (result.error) throw new Error(result.error.message);
}

async function replaceCast(showId: string, rows: any[]) {
  const cleanRows = rows
    .map((row, index) => ({
      show_id: showId,
      name: str(row.name).trim(),
      role: nullable(row.role),
      actual_cost: numOrNull(row.actual_cost),
      sort_order: index,
    }))
    .filter((row) => row.name);

  const deleteResult = await supabaseAdmin
    .schema("booking")
    .from("show_cast")
    .delete()
    .eq("show_id", showId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  if (cleanRows.length) {
    const insertResult = await supabaseAdmin
      .schema("booking")
      .from("show_cast")
      .insert(cleanRows);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

async function replaceTravel(showId: string, rows: any[]) {
  const cleanRows = rows.map((row, index) => ({
    show_id: showId,
    direction:
      row.direction === "return" ? "return" : "outbound",
    sort_order: index,
    transport_type:
      str(row.transport_type).trim() || "Sonstiges",
    booked: Boolean(row.booked),
    from_place: nullable(row.from_place),
    to_place: nullable(row.to_place),
    departure_at: nullable(row.departure_at),
    arrival_at: nullable(row.arrival_at),
    booking_info: nullable(row.booking_info),
    actual_cost: numOrNull(row.actual_cost),
    driver_name: nullable(row.driver_name),
    meeting_point: nullable(row.meeting_point),
    meeting_time: nullable(row.meeting_time),
    pickup_contact: nullable(row.pickup_contact),
    pickup_phone: nullable(row.pickup_phone),
    parking_status: nullable(row.parking_status),
    loading_zone_status: nullable(
      row.loading_zone_status
    ),
    notes: nullable(row.notes),
  }));

  const deleteResult = await supabaseAdmin
    .schema("booking")
    .from("show_travel_legs")
    .delete()
    .eq("show_id", showId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  if (cleanRows.length) {
    const insertResult = await supabaseAdmin
      .schema("booking")
      .from("show_travel_legs")
      .insert(cleanRows);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

async function replacePayments(
  showId: string,
  rows: any[]
) {
  const mappedRows = rows.map((row) => ({
    show_id: showId,
    payment_date: nullable(row.payment_date),
    amount: numOrNull(row.amount),
    payment_method: nullable(row.payment_method) || "bank",
    note: nullable(row.note),
  }));

  const incompletePayment = mappedRows.find(
    (row) => !row.payment_date && row.amount !== null
  );

  if (incompletePayment) {
    throw new Error(
      "Bitte bei einer eingetragenen Zahlung auch das Datum angeben."
    );
  }

  const cleanRows = mappedRows.filter(
    (row) => row.payment_date && row.amount !== null
  );

  const deleteResult = await supabaseAdmin
    .schema("booking")
    .from("show_payments")
    .delete()
    .eq("show_id", showId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  if (cleanRows.length) {
    const insertResult = await supabaseAdmin
      .schema("booking")
      .from("show_payments")
      .insert(cleanRows);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

async function replaceFeeExtras(showId: string, rows: any[]) {
  const allowedTypes = new Set([
    "meal_buyout",
    "travel",
    "accommodation_buyout",
    "other",
  ]);
  const allowedBilling = new Set([
    "flat",
    "per_km",
    "receipt",
    "included",
    "other",
  ]);

  const cleanRows = rows
    .map((row, index) => {
      const type = allowedTypes.has(String(row.type))
        ? String(row.type)
        : "other";
      const billing = allowedBilling.has(String(row.billing))
        ? String(row.billing)
        : "flat";

      return {
        show_id: showId,
        type,
        billing,
        amount: ["receipt", "included"].includes(billing)
          ? null
          : numOrNull(row.amount),
        note: nullable(row.note),
        sort_order: index,
      };
    })
    .filter(
      (row) =>
        row.amount !== null ||
        row.note ||
        ["receipt", "included"].includes(row.billing)
    );

  const deleteResult = await supabaseAdmin
    .schema("booking")
    .from("show_fee_extras")
    .delete()
    .eq("show_id", showId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  if (cleanRows.length) {
    const insertResult = await supabaseAdmin
      .schema("booking")
      .from("show_fee_extras")
      .insert(cleanRows);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

async function replaceTicketCategories(
  showId: string,
  categories: any[],
  sales: any[]
) {
  const soldById = new Map(
    sales
      .filter((row) => row?.id)
      .map((row) => [
        String(row.id),
        intOrNull(row.sold_count),
      ])
  );

  const cleanRows = categories
    .map((row, index) => ({
      show_id: showId,
      label: str(row.label).trim(),
      price: numOrNull(row.price),
      sold_count: row.id
        ? soldById.get(String(row.id)) ??
          intOrNull(row.sold_count)
        : intOrNull(row.sold_count),
      sort_order: index,
    }))
    .filter((row) => row.label);

  const deleteResult = await supabaseAdmin
    .schema("booking")
    .from("show_ticket_categories")
    .delete()
    .eq("show_id", showId);

  if (deleteResult.error) {
    throw new Error(deleteResult.error.message);
  }

  if (cleanRows.length) {
    const insertResult = await supabaseAdmin
      .schema("booking")
      .from("show_ticket_categories")
      .insert(cleanRows);

    if (insertResult.error) {
      throw new Error(insertResult.error.message);
    }
  }
}

/* ============================================================
   STATUS / CHECKLIST / PREVIEWS
   ============================================================ */

function getSectionStates({
  show,
  cast,
  travelLegs,
  ticketCategories,
}: {
  show: any;
  cast: any[];
  travelLegs: any[];
  ticketCategories: any[];
}) {
  const state = (ready: boolean): AreaState =>
    ready ? "done" : "open";

  const phaseOver =
    isPastShowDate(show.show_date) ||
    ["gespielt", "abgeschlossen", "abgesagt"].includes(
      String(show.internal_status || "")
    );

  const promoMaterialsKnown =
    ["Ja", "Nein"].includes(String(show.flyers_needed || "")) &&
    ["Ja", "Nein"].includes(String(show.posters_needed || ""));

  const promoNeeded =
    String(show.flyers_needed || "") === "Ja" ||
    String(show.posters_needed || "") === "Ja";

  const promoReady =
    Boolean(show.ticket_link) &&
    show.homepage_ticket_linked === true &&
    promoMaterialsKnown &&
    (!promoNeeded || Boolean(show.promo_sent_at) || show.promo_send_status === "sent");

  const techReady =
    ["available", "unavailable"].includes(
      String(show.tech_sound_status || "")
    ) &&
    ["available", "unavailable"].includes(
      String(show.tech_lights_status || "")
    );

  const backstageReady =
    ["available", "unavailable"].includes(
      String(show.backstage_status || "")
    ) &&
    ["available", "unavailable"].includes(
      String(show.catering_structured_status || "")
    );

  const travelPlanningReady =
    String(show.travel_planning_status || "") === "not_required" ||
    travelReady(travelLegs);

  const travelReadyState =
    travelPlanningReady &&
    ["organizer", "buyout", "not_required"].includes(
      String(show.accommodation_status || "")
    );

  return {
    showdata: state(
      phaseOver || Boolean(
        show.program &&
          show.venue_id &&
          show.show_date &&
          show.start_time &&
          show.capacity
      )
    ),

    contact: state(
      phaseOver || Boolean(show.contact_name && show.contact_email)
    ),

    contract: state(
      ["erledigt", "nicht_erforderlich"].includes(
        String(show.contract_status || "")
      ) &&
        Boolean(show.invoice_recipient_source)
    ),

    cast: state(phaseOver || show.cast_confirmed === true),

    promo: state(phaseOver || promoReady),

    tech: state(phaseOver || techReady),

    backstage: state(phaseOver || backstageReady),

    travel: state(phaseOver || travelReadyState),

    schedule: state(
      phaseOver ||
      Boolean(show.checklist?.["Ablauf geklärt"]) ||
      Boolean(
        show.arrival_time &&
          show.setup_time &&
          show.soundcheck_time &&
          show.entry_time
      )
    ),
  };
}

function buildChecklistView({
  show,
  sectionStates,
  paid,
  invoiceAmount,
}: {
  show: any;
  sectionStates: Record<string, AreaState>;
  paid: number;
  invoiceAmount: number;
}) {
  const state: Record<string, boolean> = {
    "Showdaten geprüft":
      Boolean(show.checklist?.["Showdaten geprüft"]),

    "Vertrag geklärt":
      ["erledigt", "nicht_erforderlich"].includes(
        String(show.contract_status || "")
      ) ||
      Boolean(show.checklist?.["Vertrag geklärt"]),

    "Ticketlink vorhanden": Boolean(show.ticket_link),

    "Ticketlink auf Homepage verlinkt":
      show.homepage_ticket_linked === true ||
      Boolean(show.checklist?.["Ticketlink auf Homepage verlinkt"]),

    "Technik geklärt":
      sectionStates.tech === "done",

    "Ablauf geklärt":
      sectionStates.schedule === "done" ||
      Boolean(show.checklist?.["Ablauf geklärt"]),

    "Zugang zur Spielstätte geklärt":
      Boolean(show.venue_access_details) ||
      Boolean(show.checklist?.["Zugang zur Spielstätte geklärt"]),

    "Anreise / Unterkunft geklärt":
      sectionStates.travel === "done",

    "Backstage / Catering geklärt":
      sectionStates.backstage === "done",

    "Besetzung vollständig":
      show.cast_confirmed === true ||
      Boolean(show.checklist?.["Besetzung vollständig"]),

    "Markus / Team informiert":
      Boolean(
        show.checklist?.["Markus / Team informiert"] ||
          show.checklist?.["Markus informiert"]
      ),

    "Promo erledigt":
      !(
        String(show.flyers_needed || "") === "Ja" ||
        String(show.posters_needed || "") === "Ja"
      ) ||
      Boolean(show.promo_sent_at) ||
      show.promo_send_status === "sent" ||
      Boolean(show.checklist?.["Promo erledigt"]),

    "GEMA geklärt":
      Boolean(
        show.checklist?.["GEMA geklärt"] ||
          show.checklist?.["GEMA erledigt"]
      ),

    "Rechnung verschickt":
      show.invoice_sent === true ||
      Boolean(show.checklist?.["Rechnung verschickt"]),

    "Zahlung vollständig":
      (invoiceAmount > 0 && paid >= invoiceAmount) ||
      Boolean(show.checklist?.["Zahlung vollständig"]),

    "Show bewertet":
      Boolean(
        show.review_audience &&
          show.review_location &&
          show.review_organization &&
          show.review_effort &&
          show.review_tech &&
          show.play_again
      ) ||
      Boolean(show.checklist?.["Show bewertet"]),
  };

  return { state };
}

function getSmartTasks({
  show, sectionStates, checklistState, files, travelLegs, economics, ticketsSoldEntered, showIsDeferred, finalCheck,
}: {
  show: any; sectionStates: Record<string, AreaState>; checklistState: Record<string, boolean>;
  files: any[]; travelLegs: any[]; economics: any; ticketsSoldEntered: boolean; showIsDeferred: boolean; finalCheck: any;
}) {
  const tasks: { label: string; href: string; manual: boolean; followUpDate?: string | null }[] = [];
  const played =
    isPastShowDate(show.show_date) ||
    ["gespielt", "abgeschlossen"].includes(String(show.internal_status || ""));
  const cancelled = String(show.internal_status || "") === "abgesagt";
  const promoNeeded = String(show.flyers_needed || "") === "Ja" || String(show.posters_needed || "") === "Ja";
  const hasContractFile = files.some((file: any) => /vertrag|contract/i.test(String(file.file_name || file.file_type || "")));

  function push(label: string, href: string, manual = false, followUpDate?: string | null) {
    if (!checklistState[label]) tasks.push({ label, href, manual, followUpDate });
  }

  if (!played && !cancelled && !showIsDeferred) {
    push("Showdaten geprüft", "#showdaten", true);
    push("Vertrag geklärt", "#vertrag-finanzen", true);
    if (!show.ticket_link) push("Ticketlink vorhanden", "#promo-ticketing");
    else if (!show.homepage_ticket_linked) push("Ticketlink auf Homepage verlinkt", "#promo-ticketing");
    if (sectionStates.tech !== "done") push("Technik geklärt", "#technik");
    if (!checklistState["Ablauf geklärt"]) push("Ablauf geklärt", "#ablauf", true);
    if (sectionStates.travel !== "done") push("Anreise / Unterkunft geklärt", "#anreise");
    if (sectionStates.backstage !== "done") push("Backstage / Catering geklärt", "#backstage");
    if (!show.cast_confirmed) push("Besetzung vollständig", "#besetzung");
    if (show.markus_included) {
      push("Markus / Team informiert", "#arbeitsliste", true);
    }
    if (promoNeeded && !show.promo_sent_at && show.promo_send_status !== "sent") tasks.push({ label: "Promo verschicken", href: "#promo-ticketing", manual: false, followUpDate: show.promo_follow_up_date });
    push("GEMA geklärt", "#arbeitsliste", true);
  }

  if (show.contract_status === "erledigt" && !hasContractFile) tasks.push({ label: "Vertrag hochladen", href: "#vertrag-finanzen", manual: false });

  if (finalCheck?.visible && !finalCheck.ready) {
    tasks.unshift({ label: "🧭 Finalcheck: Sind wir wirklich spielbereit?", href: "#finalcheck", manual: false });
  }

  if (played) {
    const travelCostMissing = travelLegs.some((leg: any) => leg?.transport_type && (leg.actual_cost === null || leg.actual_cost === undefined || String(leg.actual_cost).trim() === ""));
    if (travelCostMissing) tasks.push({ label: "Reisekosten nachtragen", href: "#anreise", manual: false });

    const hotelCostMissing = String(show.accommodation_status || "") === "buyout" && (show.accommodation_actual_cost === null || show.accommodation_actual_cost === undefined || String(show.accommodation_actual_cost).trim() === "");
    if (hotelCostMissing) tasks.push({ label: "Hotelkosten nachtragen", href: "#anreise", manual: false });

    if (
      show.billing_status !== "nicht_relevant" &&
      !checklistState["Rechnung verschickt"]
    ) {
      tasks.push({ label: "Rechnung verschicken", href: "#rechnung-zahlung", manual: false });
    } else if (show.billing_status !== "nicht_relevant" && Number(show.invoice_amount || 0) > 0 && !checklistState["Zahlung vollständig"]) {
      const due = show.invoice_due_date ? new Date(`${show.invoice_due_date}T23:59:59`) : null;
      if (!due || due.getTime() <= Date.now()) tasks.push({ label: "Zahlung nachhalten", href: "#rechnung-zahlung", manual: false, followUpDate: show.invoice_due_date });
    }

    const ticketStatus = show.ticket_sales_knowledge_status || (ticketsSoldEntered ? "known" : "open");
    if (ticketStatus === "open") tasks.push({ label: "Ticketzahlen klären", href: "#ticketzahlen", manual: false });
    if (!checklistState["Show bewertet"]) tasks.push({ label: "Show bewerten", href: "#show-bewertung", manual: false });

    const economicsIncomplete =
      !economics ||
      economics.profit === null ||
      economics.profit === undefined ||
      !economics.completed_at;

    if (economicsIncomplete && !travelCostMissing && !hotelCostMissing) {
      tasks.push({
        label:
          economics?.profit !== null && economics?.profit !== undefined
            ? "Wirtschaftlichkeit abschließen"
            : "Wirtschaftlichkeit vervollständigen",
        href: `/admin/shows/${show.id}/economics`,
        manual: false,
      });
    }
  }

  return tasks.slice(0, 10);
}

function getProductionPhase({
  show,
  effectiveShowFollowUpDate,
  finalCheck,
}: {
  show: any;
  effectiveShowFollowUpDate?: string | null;
  finalCheck: { visible: boolean; ready: boolean };
}) {
  const status = String(show.internal_status || "");

  if (status === "abgesagt") {
    return {
      key: "cancelled",
      label: "❌ Abgesagt",
      description: "Diese Show wurde abgesagt.",
      className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    };
  }

  if (status === "abgeschlossen") {
    return {
      key: "finished",
      label: "✓ Abgeschlossen",
      description: "Die Show und ihre Nachbereitung sind abgeschlossen.",
      className: "bg-zinc-100 text-zinc-600 ring-zinc-200",
    };
  }

  if (isPastShowDate(show.show_date) || status === "gespielt") {
    return {
      key: "post-show",
      label: "🧾 Nachbereitung",
      description: "Die Show ist gespielt. Jetzt zählen Abrechnung, Kosten, Ticketzahlen und Learnings.",
      className: "bg-violet-50 text-violet-700 ring-violet-100",
    };
  }

  if (isShowToday(show.show_date)) {
    return {
      key: "showday",
      label: "🎭 Showtag",
      description: "Heute ist Showtag.",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    };
  }

  if (isShowWithinDays(show.show_date, 7)) {
    if (finalCheck.ready) {
      return {
        key: "ready",
        label: "🎭 Spielbereit",
        description:
          "Der Finalcheck ist vollständig. Die Show ist aus Produktionssicht spielbereit.",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      };
    }

    return {
      key: "finalcheck",
      label: "🧭 Finalcheck",
      description:
        "7 Tage vor der Show: Jetzt zählt nur noch, ob wir wirklich spielbereit sind.",
      className: "bg-sky-50 text-sky-700 ring-sky-100",
    };
  }

  if (isShowWithinDays(show.show_date, 30)) {
    return {
      key: "production-check",
      label: "🟠 Produktionscheck",
      description:
        "30 Tage vor der Show: Sind Technik, Promo, Anreise, Kontakt und Ablauf auf Kurs?",
      className: "bg-amber-50 text-amber-800 ring-amber-100",
    };
  }

  if (!isFutureDate(effectiveShowFollowUpDate)) {
    return {
      key: "preparation",
      label: "🔧 In Vorbereitung",
      description:
        "Die Bearbeitungsphase läuft. Offene Produktionspunkte werden jetzt aktiv geklärt.",
      className: "bg-orange-50 text-orange-700 ring-orange-100",
    };
  }

  return {
    key: "deferred",
    label: `📅 Bearbeitung ab ${formatDate(effectiveShowFollowUpDate)}`,
    description:
      "Bis dahin bleibt die Show im Blick, die eigentliche Produktionsbearbeitung startet aber erst an diesem Datum.",
    className: "bg-[#eef5ff] text-[#2867d8] ring-[#dce9ff]",
  };
}

function buildFinalCheck({ show, sectionStates, checklistState }: { show: any; sectionStates: Record<string, AreaState>; checklistState: Record<string, boolean> }) {
  const playedOrCancelled =
    isPastShowDate(show.show_date) ||
    ["gespielt", "abgeschlossen", "abgesagt"].includes(String(show.internal_status || ""));
  const visible = !playedOrCancelled && isShowWithinDays(show.show_date, 7);
  const promoNeeded = String(show.flyers_needed || "") === "Ja" || String(show.posters_needed || "") === "Ja";
  const hasMarkus = Boolean(show.markus_included);
  const items = [
    { label: "Technik bestätigt", done: sectionStates.tech === "done", href: "#technik" },
    { label: "Ablauf klar", done: sectionStates.schedule === "done" || checklistState["Ablauf geklärt"] === true, href: "#ablauf" },
    { label: "Hotel klar", done: ["organizer", "buyout", "not_required"].includes(String(show.accommodation_status || "")), href: "#anreise" },
    { label: "Homepage online", done: show.homepage_ticket_linked === true, href: "#promo-ticketing" },
    { label: "Ticketlink vorhanden", done: Boolean(show.ticket_link), href: "#promo-ticketing" },
    { label: "Promo gelaufen", done: !promoNeeded || Boolean(show.promo_sent_at) || show.promo_send_status === "sent", href: "#promo-ticketing" },
    ...(hasMarkus
      ? [{
          label: "Markus informiert",
          done: checklistState["Markus / Team informiert"] === true,
          href: "#arbeitsliste",
        }]
      : []),
  ];
  return { visible, items, ready: items.every((item) => item.done), openCount: items.filter((item) => !item.done).length };
}

function promoStatusPreview(show: any) {
  if (show.promo_sent_at) return `Verschickt ${formatDate(show.promo_sent_at)}`;
  if (show.promo_follow_up_date) return `Promo-WVL ${formatDate(show.promo_follow_up_date)}`;
  const needed = String(show.flyers_needed || "") === "Ja" || String(show.posters_needed || "") === "Ja";
  return needed ? "Promo offen" : null;
}

function defaultShowFollowUpDate(showDate?: string | null) {
  if (!showDate) return null;
  const parts = String(showDate).split("-").map(Number);
  if (parts.length !== 3 || parts.some((v) => !Number.isFinite(v))) return null;
  const [year, month, day] = parts;
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCMonth(d.getUTCMonth() - 3);
  return d.toISOString().slice(0, 10);
}

function todayDateKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

function isPastShowDate(date?: string | null) {
  return Boolean(date && String(date) < todayDateKey());
}

function isShowToday(date?: string | null) {
  return Boolean(date && String(date) === todayDateKey());
}

function isFutureDate(date?: string | null) {
  if (!date) return false;
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return String(date) > todayKey;
}

function isShowWithinDays(showDate?: string | null, days = 14) {
  if (!showDate) return false;
  const target = new Date(`${showDate}T12:00:00`);
  if (Number.isNaN(target.getTime())) return false;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const diffDays = (target.getTime() - today.getTime()) / 86400000;
  return diffDays >= 0 && diffDays <= days;
}

function postState(
  show: any,
  paid: number,
  invoiceAmount: number
): AreaState {
  const rated = Boolean(
    show.review_audience &&
      show.review_location &&
      show.review_organization &&
      show.review_effort &&
      show.review_tech &&
      show.play_again
  );

  return show.invoice_sent &&
    invoiceAmount > 0 &&
    paid >= invoiceAmount &&
    rated
    ? "done"
    : "open";
}

function postPreview({
  show,
  paid,
  invoiceAmount,
  ticketsSold,
  sellableCapacity,
  occupancy,
}: any) {
  const payment =
    show.invoice_sent && invoiceAmount > 0
      ? paid >= invoiceAmount
        ? "vollständig bezahlt"
        : paid > 0
          ? `${formatEuro(invoiceAmount - paid)} offen`
          : "Zahlung offen"
      : null;

  return [
    show.invoice_sent
      ? "Rechnung verschickt"
      : "Rechnung offen",
    payment,
    ticketsSold !== null && sellableCapacity
      ? `${ticketsSold}/${sellableCapacity} Tickets${
          occupancy !== null
            ? ` · ${occupancy} %`
            : ""
        }`
      : ticketsSold !== null
        ? `${ticketsSold} Tickets`
        : "Ticketzahlen offen",
    show.play_again
      ? `Wieder spielen: ${playAgainLabel(
          show.play_again
        )}`
      : "Bewertung offen",
  ].filter(Boolean);
}

/* ============================================================
   COMPONENTS
   ============================================================ */

function PhaseHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="px-1 pt-2">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-zinc-400 ring-1 ring-black/5">
          {number}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-zinc-950">
          {title}
        </h2>
      </div>
      <p className="mt-1 pl-9 text-sm font-semibold text-zinc-500">
        {subtitle}
      </p>
    </div>
  );
}

function CompletionLine({
  label,
  done,
}: {
  label: string;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ring-1 ${
        done
          ? "bg-emerald-50 text-emerald-800 ring-emerald-100"
          : "bg-white text-zinc-600 ring-black/5"
      }`}
    >
      <span className="text-base">{done ? "✓" : "○"}</span>
      <span>{label}</span>
    </div>
  );
}

function FormSection({
  id,
  icon,
  title,
  state,
  preview,
  children,
  doneLabel = "✓ Geklärt",
}: {
  id: string;
  icon: string;
  title: string;
  state: AreaState;
  preview: any[];
  children: ReactNode;
  doneLabel?: string;
}) {
  return (
    <details
      id={id}
className="group scroll-mt-6 overflow-visible rounded-[1.15rem] bg-white shadow-sm ring-1 ring-black/5"
    >
      <summary className="list-none cursor-pointer px-4 py-3 transition hover:bg-[#fbfaf7] [&::-webkit-details-marker]:hidden">
        <div className="grid min-h-[42px] items-center gap-x-4 gap-y-1 md:grid-cols-[235px_minmax(0,1fr)_auto_22px]">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f7f8fa] text-base">
              {icon}
            </span>
            <h3 className="text-sm font-black text-zinc-950">
              {title}
            </h3>
          </div>

          <div className="min-w-0 text-xs font-semibold leading-5 text-zinc-500">
            {preview
              .filter(Boolean)
              .slice(0, 5)
              .map((value, index) => (
                <Fragment key={`${String(value)}-${index}`}>
                  {index > 0 && (
                    <span className="mx-2 text-zinc-300">
                      ·
                    </span>
                  )}
                  <span>{String(value)}</span>
                </Fragment>
              ))}
          </div>

          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black ring-1 ${
              state === "done"
                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                : "bg-amber-50 text-amber-700 ring-amber-100"
            }`}
          >
            {state === "done" ? doneLabel : "Offen"}
          </span>

          <span className="justify-self-end text-lg font-black text-zinc-500 transition group-open:rotate-90">
            ›
          </span>
        </div>
      </summary>

      <div className="border-t border-black/5 bg-[#fffdf9] p-4 sm:p-5">
        <div className="space-y-3">{children}</div>
      </div>
    </details>
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
  defaultValue?: any;
  type?: string;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      <input
        name={name}
        type={type}
        step={type === "number" ? "0.01" : undefined}
        defaultValue={defaultValue ?? ""}
        className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
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
  defaultValue?: any;
  options: [string, string][];
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      <select
        name={name}
        defaultValue={defaultValue || ""}
        className="h-11 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-bold text-zinc-900 outline-none transition focus:border-zinc-400"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function CompactTextarea({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: any;
}) {
  return (
    <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">
      {label}
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={3}
        className="min-h-[84px] rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm font-bold leading-6 text-zinc-900 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
      />
    </label>
  );
}

function SmallHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h4 className="border-b border-black/5 pb-2 text-[10px] font-black uppercase tracking-[.14em] text-zinc-400">
      {children}
    </h4>
  );
}

function FieldLabel({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold text-zinc-500">
      {children}
    </p>
  );
}

function InfoLine({
  label,
  value,
  subline,
}: {
  label: string;
  value: string;
  subline?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-300">
        {label}
      </p>
      <p className="mt-1 font-bold text-zinc-700">
        {value}
      </p>
      {subline && (
        <p className="mt-0.5 text-xs font-semibold text-zinc-400">
          {subline}
        </p>
      )}
    </div>
  );
}

function Timeline({
  label,
  value,
  strong = false,
}: {
  label: string;
  value?: string | null;
  strong?: boolean;
}) {
  return (
    <div
      className={`rounded-xl px-4 py-4 text-center ring-1 ${
        strong
          ? "bg-zinc-950 text-white ring-zinc-950"
          : "bg-[#fbf7ef] text-zinc-800 ring-black/5"
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[.12em] opacity-60">
        {label}
      </p>
      <p className="mt-1 text-lg font-black">
        {value || "—"}
      </p>
    </div>
  );
}

function ShowdayCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
      <h3 className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function ShowdayLine({
  label,
  value,
  phone,
}: {
  label: string;
  value: string;
  phone?: string | null;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[.1em] text-zinc-400">
        {label}
      </p>

      {phone ? (
        <a
          href={`tel:${phone}`}
          className="mt-0.5 block text-sm font-black text-[#2867d8]"
        >
          {value} · {phone}
        </a>
      ) : (
        <p className="mt-0.5 text-sm font-black text-zinc-900">
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function ChecklistRow({
  label,
  checked,
  manual,
}: {
  label: string;
  checked: boolean;
  manual: boolean;
}) {
  if (manual) {
    return (
      <label className="flex min-h-8 items-center gap-3 text-sm font-semibold text-zinc-700">
        <input
          id={checklistInputId(label)}
          type="checkbox"
          name={`checklist_${label}`}
          form="show-main-form"
          defaultChecked={checked}
          className="h-4 w-4 rounded accent-[#2867d8]"
        />
        <span
          className={
            checked
              ? "text-zinc-400 line-through"
              : ""
          }
        >
          {label}
        </span>
      </label>
    );
  }

  return (
    <div className="flex min-h-8 items-center gap-3 text-sm font-semibold text-zinc-700">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
          checked
            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
            : "border-zinc-300 bg-white text-transparent"
        }`}
      >
        ✓
      </span>

      <span
        className={
          checked
            ? "text-zinc-400 line-through"
            : ""
        }
      >
        {label}
      </span>
    </div>
  );
}

function ContextFiles({
  title,
  files,
  pattern,
}: {
  title: string;
  files: any[];
  pattern: RegExp;
}) {
  const matches = files.filter((file: any) =>
    pattern.test(
      `${file.file_name || ""} ${file.file_type || ""}`
    )
  );

  if (!matches.length) return null;

  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[.14em] text-zinc-400">
        {title}
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {matches.map((file: any) =>
          file.url ? (
            <a
              key={file.id}
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-3 py-2 text-xs font-black text-zinc-700 ring-1 ring-black/10"
            >
              📄 {file.file_name || "Datei"} →
            </a>
          ) : null
        )}
      </div>
    </div>
  );
}

function BottomCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-black/5">
      <h3 className="text-lg font-black tracking-tight">
        {title}
      </h3>
      <div className="mt-4 flex-1">{children}</div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-[#fbf7ef] px-4 py-3 ring-1 ring-black/5">
      <p className="text-[10px] font-black uppercase tracking-[.12em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-zinc-900">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   PREVIEW HELPERS
   ============================================================ */

function castPreview(cast: any[]) {
  if (!cast.length) return "Sonja Gründemann · solo";

  return [
    "Sonja Gründemann",
    ...cast.map(
      (person: any) =>
        `${person.name}${
          person.role ? ` (${person.role})` : ""
        }`
    ),
  ].join(" · ");
}

function showdayCastPreview(cast: any[]) {
  if (!cast.length) return "Sonja Gründemann · solo";

  return [
    "Sonja Gründemann",
    ...cast.map(
      (person: any) =>
        `${person.name}${
          person.role ? ` (${person.role})` : ""
        }`
    ),
  ].join(" · ");
}

function ticketPricePreview(categories: any[], legacy: any) {
  const prices = (categories || [])
    .map((item: any) => Number(item.price))
    .filter((value: number) => Number.isFinite(value));

  if (prices.length) {
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const euro = (value: number) =>
      value.toLocaleString("de-DE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    return min === max
      ? `Tickets ${euro(min)} €`
      : `Tickets ${euro(min)} €–${euro(max)} €`;
  }

  return legacy ? `Tickets ${legacy}` : null;
}

function techPreview(show: any) {
  const result = [
    triPreview("Ton", show.tech_sound_status),
    triPreview("Licht", show.tech_lights_status),
  ];

  if (show.tech_piano_status === "available") {
    result.push(
      show.tech_piano_model
        ? `Flügel: ${show.tech_piano_model}`
        : "Flügel vorhanden"
    );
  }

  if (show.epiano_status === "available") {
    result.push(
      show.tech_epiano_model
        ? `E-Piano: ${show.tech_epiano_model}`
        : "E-Piano vorhanden"
    );
  }

  if (show.tech_contact) {
    result.push(`Technik: ${show.tech_contact}`);
  }

  return result.filter(Boolean);
}

function showdayTechPreview(show: any) {
  return techPreview(show)
    .filter(
      (value) =>
        !String(value).includes("nicht vorhanden")
    )
    .join(" · ");
}

function triPreview(
  label: string,
  status?: string | null
) {
  if (status === "available") return `${label} ✓`;
  if (status === "unavailable")
    return `${label} nicht vorhanden`;
  return `${label} offen`;
}

function backstagePreview(show: any) {
  const status =
    show.backstage_status ||
    legacyBackstage(show);

  if (status === "available") {
    const details = [
      miniStatus(
        "Spiegel",
        show.backstage_mirror_status,
        show.backstage_mirror_available
      ),
      miniStatus(
        "Sitzplatz",
        show.backstage_seating_status,
        show.backstage_seating_available
      ),
      miniStatus(
        "Tisch",
        show.backstage_table_status,
        show.backstage_table_available
      ),
    ]
      .filter(Boolean)
      .join(" · ");

    return details
      ? `Backstage vorhanden · ${details}`
      : "Backstage vorhanden";
  }

  if (status === "unavailable") {
    return "Kein Backstage";
  }

  return "Backstage offen";
}

function cateringPreview(show: any) {
  const status =
    show.catering_structured_status ||
    legacyCatering(show.catering_status);

  if (status === "available") {
    return show.catering_details
      ? `Catering: ${compactText(
          show.catering_details,
          60
        )}`
      : "Catering vorgesehen";
  }

  if (status === "unavailable") {
    return "Kein Catering";
  }

  return "Catering offen";
}

function accommodationPreview(show: any) {
  const status =
    show.accommodation_status ||
    legacyAccommodation(show);

  if (status === "not_required") {
    return "Unterkunft nicht erforderlich";
  }

  if (status === "organizer") {
    return show.accommodation_hotel_name
      ? `Unterkunft gestellt · ${show.accommodation_hotel_name}`
      : "Unterkunft gestellt";
  }

  if (status === "buyout") {
    return show.accommodation_booked
      ? `Hotel gebucht · Buyout`
      : "Hotel noch buchen · Buyout";
  }

  return "Unterkunft offen";
}

function travelPreview(legs: any[], planningStatus?: string | null) {
  if (String(planningStatus || "") === "not_required") {
    return "Keine Anreise erforderlich";
  }

  if (!legs.length) return "";

  const outbound = legs
    .filter((row) => row.direction === "outbound")
    .map((row) => row.transport_type)
    .join(" → ");

  const returnRoute = legs
    .filter((row) => row.direction === "return")
    .map((row) => row.transport_type)
    .join(" → ");

  return [
    outbound ? `Hin: ${outbound}` : "",
    returnRoute ? `Rück: ${returnRoute}` : "",
  ]
    .filter(Boolean)
    .join(" · ");
}

function posterPreview(show: any) {
  if (show.posters_needed !== "Ja") return null;

  if (!show.poster_format) {
    return "Plakatformat offen";
  }

  return [
    (show.poster_amount_text || show.poster_amount)
      ? `Plakate ${show.poster_amount_text || show.poster_amount}`
      : "Plakate",
    show.poster_format === "other"
      ? show.poster_format_other || "anderes Format"
      : show.poster_format,
  ].join(" × ");
}

function promoLabel(
  status?: string | null,
  date?: string | null
) {
  if (status === "sent") return "Promo verschickt";

  if (status === "follow_up") {
    return `Promo WVL${
      date ? ` ${formatDate(date)}` : ""
    }`;
  }

  return "Promo offen";
}

function invoiceRecipientLabel(
  source?: string | null
) {
  if (source === "venue")
    return "Rechnung an Spielstätte";
  if (source === "custom")
    return "Rechnung abweichend";
  return "Rechnung an Vertragspartner";
}

function contractStatusLabel(
  status?: string | null
) {
  if (status === "erledigt")
    return "Vertrag erledigt";
  if (status === "nicht_erforderlich")
    return "Kein Vertrag nötig";
  return "Vertrag offen";
}

function playAgainLabel(value?: string | null) {
  if (value === "yes") return "Ja";
  if (value === "maybe") return "Vielleicht";
  if (value === "no") return "Nein";
  return value || "—";
}

function feePreview(show: any) {
  const model = String(show.fee_model || "");
  const amount =
    show.fee_base_amount !== null &&
    show.fee_base_amount !== undefined
      ? Number(show.fee_base_amount)
      : null;
  const artist =
    show.fee_artist_share !== null &&
    show.fee_artist_share !== undefined
      ? Number(show.fee_artist_share)
      : null;
  const organizer =
    show.fee_organizer_share !== null &&
    show.fee_organizer_share !== undefined
      ? Number(show.fee_organizer_share)
      : null;
  const tax =
    show.fee_tax_mode === "gross"
      ? "brutto"
      : show.fee_tax_mode === "net"
        ? "netto"
        : "";

  if (model === "fixed") {
    return amount !== null
      ? `${formatEuroCompact(amount)}${tax ? ` ${tax}` : ""}`
      : "Festgage offen";
  }

  if (model === "minimum_plus_share") {
    const parts = [
      amount !== null
        ? `${formatEuroCompact(amount)}${tax ? ` ${tax}` : ""}`
        : "Mindestgage offen",
      artist !== null && organizer !== null
        ? `${numericText(artist)}/${numericText(organizer)}`
        : null,
    ].filter(Boolean);

    return parts.join(" · ");
  }

  if (model === "share") {
    return artist !== null && organizer !== null
      ? `Beteiligung ${numericText(artist)}/${numericText(organizer)}`
      : "Beteiligung offen";
  }

  if (model === "other") {
    return show.fee_notes
      ? compactText(String(show.fee_notes), 55)
      : "Honorarvereinbarung";
  }

  return show.fee
    ? compactText(String(show.fee), 55)
    : "Honorar offen";
}

function compactText(
  value: string,
  max: number
) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}…`;
}

/* ============================================================
   ECONOMICS
   ============================================================ */

function getEconomicsSummary(economics: any) {
  if (!economics) {
    return {
      revenue: 0,
      costs: 0,
      profit: 0,
    };
  }

  const revenueItems = Array.isArray(
    economics.revenue_items
  )
    ? economics.revenue_items
    : [];

  const costItems = Array.isArray(
    economics.cost_items
  )
    ? economics.cost_items
    : [];

  const revenueFromItems = revenueItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item?.amount || 0),
    0
  );

  const costsFromItems = costItems.reduce(
    (sum: number, item: any) =>
      sum + Number(item?.amount || 0),
    0
  );

  const revenue =
    economics.revenue_total !== null &&
    economics.revenue_total !== undefined
      ? Number(economics.revenue_total || 0)
      : revenueFromItems;

  const storedProfit =
    economics.profit !== null &&
    economics.profit !== undefined
      ? Number(economics.profit || 0)
      : null;

  // Die Economics-Seite speichert im Profit bereits ALLE direkten Show-Kosten
  // (u. a. Reise, Hotel, Promo und Besetzung). Wenn cost_total nicht separat
  // gespeichert ist, leiten wir die Kosten deshalb aus Umsatz - DB ab.
  // So zeigt die Show-Akte exakt dasselbe Ergebnis wie die Wirtschaftlichkeit.
  const costs =
    economics.cost_total !== null &&
    economics.cost_total !== undefined
      ? Number(economics.cost_total || 0)
      : storedProfit !== null
        ? revenue - storedProfit
        : costsFromItems;

  const profit =
    storedProfit !== null
      ? storedProfit
      : revenue - costs;

  return { revenue, costs, profit };
}

/* ============================================================
   GENERAL HELPERS
   ============================================================ */

function travelReady(legs: any[]) {
  const outbound = legs.filter(
    (row) => row.direction === "outbound"
  );

  if (!outbound.length) return false;

  return outbound.every(
    (leg: any) =>
      !["Zug", "Fähre", "Flug"].includes(
        leg.transport_type
      ) || leg.booked
  );
}

function miniStatus(
  label: string,
  status?: string | null,
  legacy?: boolean | null
) {
  const effective =
    status || (legacy === true ? "available" : "open");

  if (effective === "available")
    return `${label} ✓`;
  if (effective === "unavailable")
    return `${label} nein`;
  return null;
}

function legacyBackstage(show: any) {
  if (show.backstage_room_available)
    return "available";
  if (show.backstage_no_room)
    return "unavailable";
  return "open";
}

function legacyCatering(value: any) {
  if (!value) return "open";
  return /nicht|kein/i.test(String(value))
    ? "unavailable"
    : "available";
}

function legacyAccommodation(show: any) {
  const value = String(
    show.accommodation_type || ""
  ).toLowerCase();

  if (!value) return "open";
  if (value.includes("buyout")) return "buyout";
  if (value.includes("nicht"))
    return "not_required";
  return "organizer";
}

function workStatusTitle(
  workStatus?: string | null,
  internalStatus?: string | null,
  openTaskCount = 0
) {
  if (internalStatus === "abgesagt")
    return "Show abgesagt";

  if (internalStatus === "abgeschlossen") {
    return openTaskCount === 0
      ? "Alles abgeschlossen"
      : "Nachbereitung ist am Zug";
  }

  if (internalStatus === "gespielt")
    return "Nachbereitung ist am Zug";

  const map: Record<string, string> = {
    offen: "Offen – Booking ist am Zug",
    wartet_auf_booking: "Booking ist am Zug",
    wartet_auf_vertragspartner:
      "Wartet auf Vertragspartner",
    wartet_auf_kuenstler:
      "Wartet auf Künstler:in",
    nichts_offen: "Aktuell nichts offen",
  };

  return (
    map[String(workStatus || "")] ||
    map.offen
  );
}

function portalProgress(show: any) {
  const fields = [
    show.show_date,
    show.venue,
    show.city,
    show.venue_address,
    show.start_time,
    show.contact_name,
    show.contact_email,
  ];

  return {
    done: fields.filter(Boolean).length,
    total: fields.length,
  };
}

function checklistInputId(label: string) {
  return `checklist-${slug(label)}`;
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildAddress(value: any) {
  if (!value) return "";

  return [
    value.street,
    [value.postal_code, value.city]
      .filter(Boolean)
      .join(" "),
  ]
    .filter(Boolean)
    .join(", ");
}

function dateParts(date?: string | null) {
  if (!date) {
    return {
      day: "--",
      month: "---",
      year: "----",
    };
  }

  const parsed = new Date(`${date}T12:00:00`);

  return {
    day: String(parsed.getDate()).padStart(2, "0"),
    month: parsed
      .toLocaleDateString("de-DE", {
        month: "short",
      })
      .replace(".", "")
      .toUpperCase(),
    year: String(parsed.getFullYear()),
  };
}

function formatDate(date?: string | null) {
  if (!date) return "";

  return new Date(`${date}T12:00:00`).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function formatTimeDisplay(
  value?: string | null
) {
  if (!value) return "";

  const match = String(value).match(
    /(\d{1,2}):(\d{2})/
  );

  if (!match) return String(value);

  return `${String(match[1]).padStart(
    2,
    "0"
  )}:${match[2]} Uhr`;
}

function normalizeTimeInput(
  value?: string | null
) {
  if (!value) return "";

  const match = String(value).match(
    /(\d{1,2}):(\d{2})/
  );

  if (!match) return "";

  return `${String(match[1]).padStart(
    2,
    "0"
  )}:${match[2]}`;
}

function normalizeTimeForDb(
  value?: string | null
) {
  if (!value) return null;
  return value;
}

function numericText(value: any) {
  if (value === null || value === undefined)
    return "";

  const match = String(value).match(
    /-?\d+(?:[.,]\d+)?/
  );

  return match
    ? match[0].replace(",", ".")
    : "";
}

function weekday(date?: string | null) {
  if (!date) return null;

  return new Date(`${date}T12:00:00`)
    .toLocaleDateString("de-DE", {
      weekday: "long",
    })
    .toUpperCase();
}

function formatEuro(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value) || 0);
}

function formatEuroCompact(value: number) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}

function parseJsonArray(value: any) {
  try {
    const parsed = JSON.parse(
      String(value || "[]")
    );
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function nullable(value: any) {
  const stringValue = str(value).trim();
  return stringValue ? stringValue : null;
}

function str(value: any) {
  return value === null || value === undefined
    ? ""
    : String(value);
}

function last(
  formData: FormData,
  key: string
) {
  const values = formData
    .getAll(key)
    .map(str)
    .map((value) => value.trim())
    .filter(Boolean);

  return values.at(-1) || null;
}

function numOrNull(value: any) {
  const stringValue = str(value)
    .trim()
    .replace(",", ".");

  if (!stringValue) return null;

  const parsed = Number(stringValue);
  return Number.isFinite(parsed)
    ? parsed
    : null;
}

function intOrNull(value: any) {
  const parsed = numOrNull(value);
  return parsed === null
    ? null
    : Math.trunc(parsed);
}
