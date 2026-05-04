"use client";

import {
  use,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Show = Record<string, string | boolean | null | undefined>;
type PortalForm = Record<string, string | boolean>;

type ShowFile = {
  id: string;
  file_type: string;
  file_name: string;
  size_bytes?: number;
  uploaded_at?: string;
};

const CONTACTS = [
  {
    name: "Virena",
    role: "Booking & Organisation",
    email: "booking@primakavi.de",
    phone: "+4917615741674",
    whatsapp: "4917615741674",
    label: "VP",
  },
  {
    name: "Kathi",
    role: "Booking & Support",
    email: "booking@primakavi.de",
    phone: "+4917615741673",
    whatsapp: "4917615741673",
    label: "KM",
  },
  {
    name: "Sonja",
    role: "Künstlerin",
    email: "kontakt@sonja-gruendemann.de",
    phone: "+4915153140758",
    whatsapp: "4915153140758",
    label: "SG",
  },
];

const DOWNLOAD_URL = "https://typischfrau.de/veranstalterbereich/";
const DOWNLOAD_PASSWORD = "Backstage!26";

const FIELD_LABEL = "grid gap-2 text-xs font-black text-zinc-700";
const FIELD_CONTROL =
  "h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100";
const FIELD_TEXTAREA =
  "rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100";

export default function ShowPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [show, setShow] = useState<Show | null>(null);
  const [form, setForm] = useState<PortalForm>({});
  const [files, setFiles] = useState<ShowFile[]>([]);
  const [fileType, setFileType] = useState("Unterschriebener Vertrag");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const didLoad = useRef(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/show/${token}`);
        if (!res.ok) throw new Error("Show konnte nicht geladen werden.");

        const data = await res.json();

        setShow(data.show || null);
        setForm(data.form || cleanShowForForm(data.show || {}));
        setLoading(false);
        didLoad.current = true;

        await loadFiles();
      } catch (err) {
        console.error(err);
        setError("Das Portal konnte nicht geladen werden.");
        setLoading(false);
      }
    }

    loadData();
  }, [token]);

  useEffect(() => {
    if (!didLoad.current || !dirty) return;

    const timer = window.setTimeout(() => {
      save("auto");
    }, 1500);

    return () => window.clearTimeout(timer);
  }, [form, dirty]);

  async function loadFiles() {
    const res = await fetch(`/api/show/${token}/files`);
    const data = await res.json();
    setFiles(data.files || []);
  }

  function updateField(field: string, value: string) {
    setSaved(false);
    setDirty(true);
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleBooleanField(field: string) {
    setSaved(false);
    setDirty(true);
    setError("");
    setForm((prev) => ({ ...prev, [field]: !isCheckedValue(prev[field]) }));
  }

  function isChecked(field: string) {
    return isCheckedValue(form[field]);
  }

  function isCheckedValue(value: string | boolean | undefined) {
    return value === true || value === "true" || value === "1";
  }

  async function save(mode: "manual" | "auto" = "manual") {
    if (saving) return;

    try {
      setSaving(true);
      setError("");

      const res = await fetch(`/api/show/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        console.error("Speichern fehlgeschlagen:", data);
        throw new Error(data?.error || "Speichern fehlgeschlagen.");
      }

      setSaving(false);
      setSaved(true);
      setDirty(false);
      setLastSavedAt(
        new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      if (mode === "manual") {
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
      setSaving(false);
      setError("Speichern nicht möglich. Bitte später erneut versuchen.");
    }
  }

  async function uploadFile(file: File | null) {
    if (!file) return;

    try {
      setUploading(true);
      setUploadMessage("");

      const data = new globalThis.FormData();
      data.append("file", file);
      data.append("file_type", fileType);

      const res = await fetch(`/api/show/${token}/files`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload fehlgeschlagen.");

      setUploadMessage("Datei hochgeladen ✓");
      await loadFiles();
    } catch (err) {
      console.error(err);
      setUploadMessage("Upload nicht möglich. Bitte erneut versuchen.");
    } finally {
      setUploading(false);
    }
  }

  async function copyToken() {
    await navigator.clipboard.writeText(token);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function copyPassword() {
    await navigator.clipboard.writeText(DOWNLOAD_PASSWORD);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const completion = useMemo(() => {
    const items = [
      {
        label: "Veranstaltung",
        done: !!form.program && !!form.show_date && !!form.venue,
      },
      {
        label: "Kontakt",
        done: !!form.contact_name && !!form.contact_email,
      },
      {
        label: "Ablauf",
        done: !!form.entry_time && !!form.start_time,
      },
      {
        label: "Technik",
        done:
          !!form.tech_sound_available ||
          !!form.tech_lights_available ||
          !!form.tech_notes ||
          !!form.piano_type,
      },
      {
        label: "Vertrag / Finanzen",
        done: !!form.contract_status || !!form.fee || !!form.ticket_prices,
      },
      {
        label: "Rechnung",
        done: !!form.invoice_email || !!form.invoice_address,
      },
      {
        label: "Promotion",
        done: !!form.flyers_needed || !!form.posters_needed,
      },
      {
        label: "Backstage / Catering",
        done:
          !!form.catering_status ||
          !!form.backstage_room_available ||
          !!form.backstage_no_room,
      },
      {
        label: "Anreise / Unterkunft",
        done:
          !!form.accommodation_type ||
          !!form.travel_notes ||
          !!form.parking_available,
      },
      {
        label: "Datei hochgeladen",
        done: files.length > 0,
      },
    ];

    return items;
  }, [form, files.length]);

  const progress = completion.filter((item) => item.done).length;
  const missing = completion.filter((item) => !item.done);

  const saveStatus = useMemo(() => {
    if (error) return error;
    if (saving) return "Speichert automatisch …";
    if (dirty) return "Änderungen noch nicht gespeichert";
    if (lastSavedAt) return `Zuletzt gespeichert um ${lastSavedAt} Uhr`;
    if (saved) return "Gespeichert. Danke euch! ✨";
    return "Ihr macht den Unterschied. 🙌";
  }, [dirty, error, lastSavedAt, saved, saving]);

  const date = formatDate(asString(form.show_date));

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] text-zinc-950">
        <div className="rounded-3xl bg-white px-8 py-6 font-black shadow-xl">
          Portal wird geladen …
        </div>
      </main>
    );
  }

  if (!show) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fbf7ef] text-zinc-950">
        <div className="rounded-3xl bg-white px-8 py-6 font-black shadow-xl">
          Show wurde nicht gefunden.
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fbf7ef] px-5 py-6 text-zinc-950">
      <div className="mx-auto max-w-7xl pb-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-3xl font-black tracking-tight">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white shadow-md">
                <img
                  src="/primakavi-logo.png"
                  alt="primakavi"
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <span>primakavi</span>
            </div>

            <p className="hidden text-xs font-black uppercase tracking-[0.25em] text-zinc-500 sm:block">
              Show Portal
            </p>
          </div>

          <div className="relative hidden items-center gap-3 sm:flex">
            <HelpButton />
          </div>
        </header>

        <section className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-12 text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(221,242,26,0.20),transparent_24%),radial-gradient(circle_at_24%_34%,rgba(168,85,247,0.26),transparent_30%),radial-gradient(circle_at_76%_62%,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(221,242,26,0.15),transparent_24%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.03))]" />

          <Doodle className="right-16 top-5 rotate-12 text-5xl text-[#DDF21A]/80">
            ↘
          </Doodle>
          <Doodle className="right-[11.25rem] bottom-5 rotate-[10deg] text-4xl text-pink-400/80">
            ☆
          </Doodle>
          <Doodle className="left-[52%] top-5 rotate-[8deg] text-8xl text-pink-400/80">
            ♕
          </Doodle>

          <div className="relative grid gap-10 lg:grid-cols-[1.25fr_0.8fr]">
            <div>
              <p className="mb-5 text-sm font-black uppercase tracking-[0.22em] text-zinc-300">
                Veranstalter-Infos zum Auftritt
              </p>

              <h1 className="max-w-2xl text-5xl font-black leading-[1.02] tracking-tight md:text-6xl">
                Schön, dass ihr Sonja dabei habt!
              </h1>

              <div className="mt-3 h-3 w-80 max-w-full rounded-full bg-gradient-to-r from-pink-500 via-pink-400 to-[#DDF21A] shadow-[0_0_30px_rgba(236,72,153,0.45)]" />

              <p className="mt-7 max-w-xl text-lg leading-8 text-zinc-200">
                Bitte ergänzt alle wichtigen Infos zu Ablauf, Technik, Anreise
                und Unterkunft. So wird alles perfekt. 🤘
              </p>
            </div>

<div className="self-center rounded-[2rem] border border-white/15 bg-white/15 p-5 shadow-2xl backdrop-blur-2xl">
  <div className="grid grid-cols-[100px_1fr] gap-5">
    <div className="flex min-h-[155px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/15 p-4 text-center shadow-inner">
      <p className="text-xs font-black uppercase text-zinc-300">
        {asString(form.weekday) || "Datum"}
      </p>

      <p className="mt-2 text-5xl font-black leading-none">
        {date.day}
      </p>

      <p className="mt-2 text-sm font-black uppercase">
        {date.month}
      </p>

      <p className="text-xs text-zinc-300">
        {date.year}
      </p>
    </div>

    <div>
      <h2 className="text-xl font-black">
        {asString(form.artist) || "Sonja Gründemann"}
      </h2>

      <p className="mt-1 font-semibold text-zinc-300">
        {asString(form.program) || "Programm offen"}
      </p>

      <div className="mt-5 space-y-2 text-sm">
        <HeroPill>◷ {getHeroTime(form)}</HeroPill>
        <HeroPill>⌖ {getHeroLocation(form)}</HeroPill>
      </div>
    </div>
  </div>
</div>
          </div>
        </section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
          <form className="space-y-6">
            <FormSection
              number="01"
              title="Veranstaltung"
              doodle="〰"
              doodleColor="text-orange-400/55"
            >
              <CompactGrid>
                <Input
                  label="Programm"
                  value={form.program}
                  onChange={(v) => updateField("program", v)}
                  placeholder="Jetzt mal Tacheles"
                />
                <Input
                  label="Datum"
                  type="date"
                  value={form.show_date}
                  onChange={(v) => updateField("show_date", v)}
                />
                <Input
                  label="Veranstaltungsort / Location"
                  value={form.venue}
                  onChange={(v) => updateField("venue", v)}
                  placeholder="Name der Location"
                />
                <Input
                  label="Stadt / Ort"
                  value={form.city}
                  onChange={(v) => updateField("city", v)}
                  placeholder="z.B. Hamburg"
                />
                <Input
                  label="Adresse"
                  value={form.venue_address}
                  onChange={(v) => updateField("venue_address", v)}
                  placeholder="Straße, PLZ, Ort"
                />
              </CompactGrid>
            </FormSection>

            <FormSection
              number="02"
              title="Organisation & Kontakt"
              doodle="☆"
              doodleColor="text-pink-400/60"
            >
              <CompactGrid>
                <Input
                  label="Ansprechpartner:in"
                  value={form.contact_name}
                  onChange={(v) => updateField("contact_name", v)}
                  placeholder="Vor- und Nachname"
                />
                <Input
                  label="E-Mail"
                  value={form.contact_email}
                  onChange={(v) => updateField("contact_email", v)}
                  placeholder="name@beispiel.de"
                />
                <Input
                  label="Telefon"
                  value={form.contact_phone}
                  onChange={(v) => updateField("contact_phone", v)}
                  placeholder="+49 123 456789"
                />
                <Input
                  label="Mobilnummer für Zugang am Veranstaltungstag"
                  value={form.emergency_phone}
                  onChange={(v) => updateField("emergency_phone", v)}
                  placeholder="+49 123 456789"
                />
              </CompactGrid>
            </FormSection>

            <FormSection
              number="03"
              title="Ablauf & Planung"
              doodle="↙"
              doodleColor="text-orange-400/60"
            >
              <CompactGrid>
                <Input
                  label="Aufbauzeit / Soundcheck"
                  value={form.soundcheck_time}
                  onChange={(v) => updateField("soundcheck_time", v)}
                  placeholder="z.B. 18:00 Uhr"
                />
                <Input
                  label="Einlass für die Gäste"
                  value={form.entry_time}
                  onChange={(v) => updateField("entry_time", v)}
                  placeholder="z.B. 19:00 Uhr"
                />
                <Input
                  label="Showbeginn"
                  value={form.start_time}
                  onChange={(v) => updateField("start_time", v)}
                  placeholder="z.B. 20:00 Uhr"
                />
                <Input
                  label="Gewünschte Ankunft"
                  value={form.arrival_time}
                  onChange={(v) => updateField("arrival_time", v)}
                  placeholder="z.B. 17:30 Uhr"
                />
              </CompactGrid>

              <Textarea
                label="Besonderheiten zum Ablauf"
                value={form.schedule_notes}
                onChange={(v) => updateField("schedule_notes", v)}
                placeholder="Gibt es Besonderheiten, Hinweise oder Wünsche zum Ablauf?"
              />
            </FormSection>

            <FormSection
              number="04"
              title="Technik"
              doodle="♫"
              doodleColor="text-purple-400/55"
            >
              <BlockTitle>Welche Technik ist vor Ort vorhanden?</BlockTitle>
              <CompactGrid>
                <Checkbox
                  label="Ton vorhanden"
                  checked={isChecked("tech_sound_available")}
                  onChange={() => toggleBooleanField("tech_sound_available")}
                />
                <Checkbox
                  label="Licht vorhanden"
                  checked={isChecked("tech_lights_available")}
                  onChange={() => toggleBooleanField("tech_lights_available")}
                />
              </CompactGrid>

              <CompactGrid>
                <Select
                  label="Ist ein Klavier oder Flügel vor Ort?"
                  value={form.piano_type}
                  onChange={(v) => updateField("piano_type", v)}
                  options={["Klavier", "Flügel", "Nein", "Noch offen"]}
                />
                <Select
                  label="Ist ein E-Piano vor Ort?"
                  value={form.epiano_available}
                  onChange={(v) => updateField("epiano_available", v)}
                  options={["Ja", "Nein", "Noch offen"]}
                />
                <Input
                  label="Marke / Modell"
                  value={form.piano_notes}
                  onChange={(v) => updateField("piano_notes", v)}
                  placeholder="z.B. Yamaha CP88, Stimmung etc."
                />
                <Input
                  label="Technik-Ansprechpartner"
                  value={form.tech_contact}
                  onChange={(v) => updateField("tech_contact", v)}
                  placeholder="Name & Kontakt"
                />
              </CompactGrid>

              <Textarea
                label="Besonderheiten zur Technik"
                value={form.tech_notes}
                onChange={(v) => updateField("tech_notes", v)}
                placeholder="Alles, was wir technisch wissen sollten."
              />
            </FormSection>

            <FormSection
              number="05"
              title="Vertrag & Finanzen"
              doodle="♡"
              doodleColor="text-orange-400/60"
            >
              <CompactGrid>
                <Select
                  label="Aktueller Vertragsstatus"
                  value={form.contract_status}
                  onChange={(v) => updateField("contract_status", v)}
                  options={[
                    "Vertrag liegt vor",
                    "In Vorbereitung",
                    "Noch offen",
                    "Wird separat per E-Mail geregelt",
                    "Bitte sende mir einen Vertrag zu",
                  ]}
                />
                <Input
                  label="Honorar"
                  value={form.fee}
                  onChange={(v) => updateField("fee", v)}
                  placeholder="netto / brutto"
                />
                <Input
                  label="Eintrittspreise"
                  value={form.ticket_prices}
                  onChange={(v) => updateField("ticket_prices", v)}
                  placeholder="regulär / ermäßigt / VVK / AK"
                />
                <Input
                  label="Anzahl Plätze / Kapazität"
                  value={form.capacity}
                  onChange={(v) => updateField("capacity", v)}
                  placeholder="z.B. 220"
                />
                <Input
                  label="Rechnungs-E-Mail"
                  value={form.invoice_email}
                  onChange={(v) => updateField("invoice_email", v)}
                  placeholder="rechnung@beispiel.de"
                />
                <Input
                  label="Bestellnummer / PO-Nummer"
                  value={form.po_number}
                  onChange={(v) => updateField("po_number", v)}
                  placeholder="falls benötigt"
                />
              </CompactGrid>

              <Input
                label="Ticketlink"
                value={form.ticket_link}
                onChange={(v) => updateField("ticket_link", v)}
                placeholder="https://..."
              />

              <Textarea
                label="Rechnungsadresse"
                value={form.invoice_address}
                onChange={(v) => updateField("invoice_address", v)}
                placeholder="Firma / Einrichtung, Straße, PLZ Ort, ggf. Abteilung"
              />

              <Textarea
                label="Hinweise zur Rechnung / Vertrag"
                value={form.contract_notes}
                onChange={(v) => updateField("contract_notes", v)}
                placeholder="Besonderheiten zur Abrechnung, Vertrag, Bestellnummer etc."
              />
            </FormSection>

            <FormSection
              number="06"
              title="Promotion"
              doodle="✦"
              doodleColor="text-pink-400/60"
            >
              <CompactGrid>
                <Input
                  label="Anzahl Freikarten"
                  value={form.free_tickets}
                  onChange={(v) => updateField("free_tickets", v)}
                  placeholder="falls vereinbart"
                />
                <Select
                  label="Werden Flyer benötigt?"
                  value={form.flyers_needed}
                  onChange={(v) => updateField("flyers_needed", v)}
                  options={["Ja", "Nein", "Noch offen"]}
                />
                <Input
                  label="Anzahl Flyer"
                  value={form.flyer_amount}
                  onChange={(v) => updateField("flyer_amount", v)}
                  placeholder="falls bekannt"
                />
                <Select
                  label="Werden Plakate benötigt?"
                  value={form.posters_needed}
                  onChange={(v) => updateField("posters_needed", v)}
                  options={["Ja", "Nein", "Noch offen"]}
                />
              </CompactGrid>

              <Input
                label="Plakate: Anzahl & Größe"
                value={form.poster_details}
                onChange={(v) => updateField("poster_details", v)}
                placeholder="z.B. 20 x A2"
              />
              <Textarea
                label="Weitere Hinweise zur Promotion"
                value={form.promotion}
                onChange={(v) => updateField("promotion", v)}
                placeholder="Alles, was für Werbung und Ankündigung wichtig ist."
              />
            </FormSection>

            <FormSection
              number="07"
              title="Verpflegung & Extras"
              doodle="〰"
              doodleColor="text-teal-500/55"
            >
              <CompactGrid>
                <Select
                  label="Catering / Getränke vorgesehen?"
                  value={form.catering_status}
                  onChange={(v) => updateField("catering_status", v)}
                  options={["Ja", "Nein", "Noch offen"]}
                />
                <Input
                  label="Details Catering"
                  value={form.catering_details}
                  onChange={(v) => updateField("catering_details", v)}
                  placeholder="Getränke, Snacks, Besonderheiten..."
                />
              </CompactGrid>

              <BlockTitle>Garderobe / Backstage-Ausstattung</BlockTitle>
              <CompactGrid>
                <Checkbox
                  label="Raum vorhanden"
                  checked={isChecked("backstage_room_available")}
                  onChange={() => toggleBooleanField("backstage_room_available")}
                />
                <Checkbox
                  label="Spiegel vorhanden"
                  checked={isChecked("backstage_mirror_available")}
                  onChange={() =>
                    toggleBooleanField("backstage_mirror_available")
                  }
                />
                <Checkbox
                  label="Sitzgelegenheit"
                  checked={isChecked("backstage_seating_available")}
                  onChange={() =>
                    toggleBooleanField("backstage_seating_available")
                  }
                />
                <Checkbox
                  label="Tisch"
                  checked={isChecked("backstage_table_available")}
                  onChange={() => toggleBooleanField("backstage_table_available")}
                />
                <Checkbox
                  label="Kein Backstage Raum vorhanden"
                  checked={isChecked("backstage_no_room")}
                  onChange={() => toggleBooleanField("backstage_no_room")}
                />
              </CompactGrid>

              <Textarea
                label="Weitere Hinweise zu Backstage / Garderobe"
                value={form.backstage_notes}
                onChange={(v) => updateField("backstage_notes", v)}
                placeholder="Alles, was wir zu Garderobe oder Backstage wissen sollten."
              />
            </FormSection>

            <FormSection
              number="08"
              title="Unterkunft & Anreise"
              doodle="↗"
              doodleColor="text-orange-400/60"
            >
              <Select
                label="Wie ist die Unterkunft geregelt?"
                value={form.accommodation_type}
                onChange={(v) => updateField("accommodation_type", v)}
                options={[
                  "Hotel wird vom Veranstalter gestellt",
                  "Hotel-Buyout wird gezahlt",
                  "Hotel organisiert Sonja selbst",
                  "Keine Übernachtung notwendig",
                  "Sonstiges",
                ]}
              />

              <CompactGrid>
                <Input
                  label="Hotel / Unterkunft Name"
                  value={form.accommodation_hotel_name}
                  onChange={(v) => updateField("accommodation_hotel_name", v)}
                  placeholder="Name der Unterkunft"
                />
                <Input
                  label="Hotel-Buyout"
                  value={form.accommodation_buyout}
                  onChange={(v) => updateField("accommodation_buyout", v)}
                  placeholder="z.B. 120 € netto"
                />
              </CompactGrid>

              <Textarea
                label="Adresse der Unterkunft"
                value={form.accommodation_address}
                onChange={(v) => updateField("accommodation_address", v)}
                placeholder="Hotelname, Straße, PLZ Ort"
              />

              <Textarea
                label="Sonstiges zur Unterkunft"
                value={form.accommodation_notes}
                onChange={(v) => updateField("accommodation_notes", v)}
                placeholder="Sonderregelungen, Check-in, Kostenübernahme, Ansprechpartner..."
              />

              <BlockTitle>Wie ist die Anreise organisiert?</BlockTitle>
              <CompactGrid>
                <Checkbox
                  label="Parkplatz vor Ort vorhanden"
                  checked={isChecked("parking_available")}
                  onChange={() => toggleBooleanField("parking_available")}
                />
                <Checkbox
                  label="Ladezone / direkter Bühneneingang vorhanden"
                  checked={isChecked("loading_zone_available")}
                  onChange={() => toggleBooleanField("loading_zone_available")}
                />
                <Checkbox
                  label="Keine Parkmöglichkeit vor Ort"
                  checked={isChecked("no_parking_available")}
                  onChange={() => toggleBooleanField("no_parking_available")}
                />
                <Checkbox
                  label="Anreise mit öffentlichen Verkehrsmitteln empfohlen"
                  checked={isChecked("public_transport_recommended")}
                  onChange={() =>
                    toggleBooleanField("public_transport_recommended")
                  }
                />
              </CompactGrid>

              <Input
                label="Parkdetails"
                value={form.parking_details}
                onChange={(v) => updateField("parking_details", v)}
                placeholder="Parkplatz, Parkhaus, Einfahrt, Durchfahrtshöhe..."
              />

              <Textarea
                label="Details zur Anreise"
                value={form.travel_notes}
                onChange={(v) => updateField("travel_notes", v)}
                placeholder="Parkhaus-Adresse, Einfahrt, Schranke, Klingel, Durchfahrtshöhe..."
              />
            </FormSection>

            <FormSection
              number="09"
              title="Sonstiges"
              doodle="?"
              doodleColor="text-zinc-400/60"
            >
              <Textarea
                label="Gibt es noch etwas, das wir wissen sollten?"
                value={form.general_notes}
                onChange={(v) => updateField("general_notes", v)}
                placeholder="Weitere Hinweise oder Besonderheiten..."
              />
            </FormSection>

            <FormSection
              number="10"
              title="Dateien & Unterlagen"
              doodle="✈"
              doodleColor="text-purple-400/60"
            >
              <div className="grid gap-4 md:grid-cols-[260px_1fr]">
                <label className={FIELD_LABEL}>
                  Was wird hochgeladen?
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className={FIELD_CONTROL}
                  >
                    <option>Unterschriebener Vertrag</option>
                    <option>Technikplan Bühne / Raum</option>
                    <option>Saalplan / Bestuhlungsplan</option>
                    <option>Anfahrts- / Ladeinfos</option>
                    <option>Rechnungs- / Bestellunterlage</option>
                    <option>Sonstiges</option>
                  </select>
                </label>

                <label className="flex cursor-pointer items-center justify-center gap-4 rounded-2xl bg-white px-5 py-5 text-left transition hover:scale-[1.01] hover:bg-white/90">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                    ⇧
                  </div>
                  <div>
                    <p className="font-black text-purple-900">
                      {uploading ? "Upload läuft …" : "Datei auswählen"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-purple-700">
                      Vertrag, Technikplan, Saalplan, Anfahrtsinfos oder weitere
                      Unterlagen
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => uploadFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {uploadMessage && (
                <p className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-purple-800">
                  {uploadMessage}
                </p>
              )}

              {files.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-black text-purple-900">
                    Hochgeladene Dateien
                  </p>
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-black text-zinc-900">
                          {file.file_name}
                        </p>
                        <p className="text-xs font-semibold text-zinc-500">
                          {file.file_type} · {formatBytes(file.size_bytes)}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">
                        hochgeladen
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </FormSection>

            <FormSection
              number="11"
              title="Downloads & Materialien"
              doodle="↓"
              doodleColor="text-[#DDF21A]/80"
            >
              <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="text-lg font-black text-zinc-900">
                    Veranstalterbereich öffnen
                  </p>
                  <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-zinc-600">
                    Hier findet ihr Bühnenanweisung, GEMA-Liste, Plakate,
                    Szenenfotos und weitere Materialien zur Vorbereitung.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-700">
                    <span>
                      Passwort:{" "}
                      <span className="font-black text-zinc-950">
                        {DOWNLOAD_PASSWORD}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={copyPassword}
                      className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700"
                    >
                      kopieren
                    </button>
                  </div>
                </div>

                <a
                  href={DOWNLOAD_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-400 to-[#DDF21A] px-8 text-base font-black text-white shadow-lg transition hover:scale-[1.03]"
                >
                  Bereich öffnen →
                </a>
              </div>
            </FormSection>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <SideCard title="Status der Angaben" tone="purple">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-black text-purple-700">
                  {progress} / {completion.length} erledigt
                </p>
              </div>
              <div className="mb-5 h-2 rounded-full bg-purple-200">
                <div
                  className="h-2 rounded-full bg-purple-500 transition-all"
                  style={{
                    width: `${(progress / completion.length) * 100}%`,
                  }}
                />
              </div>

              <div className="space-y-3">
                {completion.map((item) => (
                  <Status key={item.label} label={item.label} done={item.done} />
                ))}
              </div>
            </SideCard>

            <SideCard
              title="Noch offen"
              tone={missing.length === 0 ? "teal" : "amber"}
            >
              {missing.length === 0 ? (
                <p className="text-sm font-bold leading-6 text-zinc-700">
                  Alles bereit 🎉 Danke fürs Ausfüllen.
                </p>
              ) : (
                <div className="space-y-3">
                  {missing.map((item) => (
                    <p
                      key={item.label}
                      className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-zinc-700"
                    >
                      {item.label}
                    </p>
                  ))}
                </div>
              )}
            </SideCard>

            <SideCard title="Show-ID" tone="zinc">
              <div className="flex items-center justify-between gap-4">
                <p className="break-all font-mono text-lg font-black">{token}</p>
                <button
                  type="button"
                  onClick={copyToken}
                  className="rounded-2xl bg-white px-3 py-2 text-sm font-black transition hover:bg-zinc-100"
                >
                  ⧉
                </button>
              </div>
            </SideCard>

            <SideCard title="Hinweis" tone="amber">
              <div className="relative">
                <Doodle className="right-2 top-0 rotate-12 text-3xl text-orange-400/50">
                  ♢
                </Doodle>
                <p className="text-sm font-semibold leading-7 text-zinc-700">
                  Nicht alles muss bereits feststehen. Offene Punkte können leer
                  bleiben oder mit „noch offen“ beantwortet werden.
                </p>
              </div>
            </SideCard>

            <div className="relative rounded-[1.75rem] bg-teal-100 p-6 pb-0 shadow-xl shadow-zinc-200/80">
              <Doodle className="left-[10.75rem] top-[10.5rem] rotate-[18deg] text-8xl text-purple-500/80">
                ♕
              </Doodle>
              <Doodle className="right-4 top-[10.25rem] rotate-[8deg] text-5xl text-pink-400/80">
                ♡
              </Doodle>

              <h3 className="text-lg font-black">Fragen?</h3>
              <p className="mt-1 text-sm font-semibold text-zinc-700">
                Wir sind für euch da!
              </p>

              <div className="mt-5 space-y-3 text-sm font-semibold">
                <p>✉ booking@primakavi.de</p>
                <p>☏ Virena: +49 176 1574 1674</p>
                <p>☏ Kathi: +49 176 1574 1673</p>
              </div>

              <div className="relative mt-5 h-80 overflow-visible">
                <img
                  src="/team.png"
                  alt="Team primakavi"
                  className="absolute bottom-[-65px] right-[-48px] h-[128%] w-auto object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </aside>
        </div>

        <div className="sticky bottom-5 z-20 mt-8 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-black">💗 Danke für eure Unterstützung!</p>
              <p
                className={`text-sm ${
                  error
                    ? "text-red-300"
                    : dirty
                      ? "text-yellow-200"
                      : "text-zinc-300"
                }`}
              >
                {saved && !dirty
                  ? "Danke! Eure Angaben sind bei uns angekommen."
                  : saveStatus}
              </p>
            </div>

            <div className="flex items-center gap-5">
              <p className="hidden text-right text-sm text-zinc-400 sm:block">
                Autosave aktiv
                <br />
                manuell speichern möglich
              </p>

              <button
                type="button"
                onClick={() => save("manual")}
                disabled={saving}
                className="rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-9 py-4 font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving
                  ? "Speichert …"
                  : saved && !dirty
                    ? "Gespeichert ✓"
                    : "Angaben speichern →"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-xs font-semibold text-zinc-500">
        Die Angaben werden ausschließlich zur Vorbereitung des Auftritts genutzt.
      </p>
    </main>
  );
}

function cleanShowForForm(show: Show): PortalForm {
  const result: PortalForm = {};

  Object.entries(show || {}).forEach(([key, value]) => {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  });

  return result;
}

function asString(value: string | boolean | null | undefined) {
  return typeof value === "string" ? value : "";
}
function getHeroTime(form: PortalForm) {
  const start = asString(form.start_time);
  const entry = asString(form.entry_time);

  if (start && entry) return `${start} · Einlass ${entry}`;
  if (start) return `${start} · Einlass offen`;
  if (entry) return `Beginn offen · Einlass ${entry}`;

  return "Beginn & Einlass offen";
}

function getHeroLocation(form: PortalForm) {
  const venue = asString(form.venue);
  const city = asString(form.city);

  if (venue && city) return `${venue}, ${city}`;
  if (venue) return `${venue}, Ort offen`;
  if (city) return `Location offen, ${city}`;

  return "Location & Ort offen";
}

function HelpButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="group flex cursor-pointer items-center gap-5 rounded-full bg-white px-6 py-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
      >
        <div className="text-right">
          <p className="text-lg font-black text-zinc-950">Fragen?</p>
          <p className="text-sm font-semibold text-zinc-500 group-hover:text-zinc-700">
            Wir helfen gern.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-3">
            <Avatar initials="VP" />
            <Avatar initials="KM" />
            <Avatar initials="SG" />
          </div>

          <span className="text-xl font-black text-zinc-900 transition group-hover:translate-x-1">
            →
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-20 z-50 w-80 rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-zinc-300/70">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-lg font-black text-zinc-950">Kontakt</p>
              <p className="text-sm font-semibold text-zinc-500">
                Direkt erreichbar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-black transition hover:bg-zinc-200"
            >
              ×
            </button>
          </div>

          <div className="space-y-3">
            {CONTACTS.map((contact) => (
              <div key={contact.name} className="rounded-2xl bg-zinc-50 p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={contact.label} small />

                  <div>
                    <p className="font-black text-zinc-950">{contact.name}</p>
                    <p className="text-xs font-bold text-zinc-500">
                      {contact.role}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs font-black">
                  <a
                    href={`mailto:${contact.email}`}
                    className="rounded-full bg-pink-100 px-3 py-2 text-pink-700 transition hover:bg-pink-200"
                  >
                    ✉ Mail
                  </a>

                  {contact.phone && (
                    <a
                      href={`tel:${contact.phone}`}
                      className="rounded-full bg-purple-100 px-3 py-2 text-purple-700 transition hover:bg-purple-200"
                    >
                      ☎ Anrufen
                    </a>
                  )}

                  {contact.whatsapp && (
                    <a
                      href={`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
                        `Hallo ${contact.name}, ich habe eine Frage zum Auftritt von Sonja 🙂`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-700 transition hover:bg-emerald-200"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompactGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function BlockTitle({ children }: { children: ReactNode }) {
  return <p className="text-sm font-black text-zinc-700">{children}</p>;
}

function getSectionTheme(title: string) {
  const themes: Record<string, { shell: string; number: string }> = {
    Veranstaltung: {
      shell: "border-purple-200 bg-purple-50/60",
      number: "from-purple-200 to-pink-300",
    },
    "Organisation & Kontakt": {
      shell: "border-pink-200 bg-pink-50/60",
      number: "from-pink-200 to-rose-300",
    },
    "Ablauf & Planung": {
      shell: "border-orange-200 bg-orange-50/60",
      number: "from-amber-200 to-orange-300",
    },
    Technik: {
      shell: "border-purple-200 bg-purple-50/60",
      number: "from-purple-200 to-fuchsia-300",
    },
    "Vertrag & Finanzen": {
      shell: "border-orange-200 bg-orange-50/60",
      number: "from-orange-200 to-red-300",
    },
    Promotion: {
      shell: "border-pink-200 bg-pink-50/60",
      number: "from-pink-200 to-rose-300",
    },
    "Verpflegung & Extras": {
      shell: "border-teal-200 bg-teal-50/60",
      number: "from-teal-200 to-emerald-300",
    },
    "Unterkunft & Anreise": {
      shell: "border-amber-200 bg-amber-50/60",
      number: "from-amber-200 to-orange-300",
    },
    "Dateien & Unterlagen": {
      shell: "border-purple-300 bg-purple-50/60",
      number: "from-purple-200 to-fuchsia-300",
    },
    Sonstiges: {
      shell: "border-zinc-200 bg-zinc-50/70",
      number: "from-zinc-200 to-zinc-300",
    },
    "Downloads & Materialien": {
      shell: "border-lime-200 bg-lime-50/60",
      number: "from-[#DDF21A] to-pink-300",
    },
  };

  return (
    themes[title] ?? {
      shell: "border-zinc-200 bg-zinc-50/60",
      number: "from-zinc-200 to-zinc-300",
    }
  );
}

function FormSection({
  number,
  title,
  doodle,
  doodleColor,
  children,
}: {
  number: string;
  title: string;
  doodle: string;
  doodleColor: string;
  children: ReactNode;
}) {
  const theme = getSectionTheme(title);

  return (
    <section className="relative rounded-[1.75rem] bg-white p-6 shadow-xl shadow-zinc-200/70">
      <Doodle
        className={`right-7 top-7 rotate-[-8deg] text-3xl ${doodleColor}`}
      >
        {doodle}
      </Doodle>

      <div className="mb-6 flex items-start gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.number} text-xl font-black text-zinc-900`}
        >
          {number}
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight text-zinc-950">
            {title}
          </h2>
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
  children,
  tone = "zinc",
}: {
  title: string;
  children: ReactNode;
  tone?: "zinc" | "purple" | "amber" | "teal";
}) {
  const styles = {
    zinc: "border-zinc-200 bg-zinc-50/70",
    purple: "border-purple-200 bg-purple-50/70",
    amber: "border-amber-200 bg-amber-50/70",
    teal: "border-teal-200 bg-teal-50/70",
  }[tone];

  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-xl shadow-zinc-200/70">
      <h3 className="mb-4 text-lg font-black text-zinc-950">{title}</h3>
      <div className={`rounded-3xl border-2 border-dashed p-4 ${styles}`}>
        {children}
      </div>
    </section>
  );
}

function sectionDescription(title: string) {
  const descriptions: Record<string, string> = {
    Veranstaltung: "Grunddaten zum Auftritt.",
    "Organisation & Kontakt": "Wer ist vor Ort erreichbar?",
    "Ablauf & Planung": "Alles für Timing und Ablauf.",
    Technik: "Bitte so konkret wie möglich.",
    "Vertrag & Finanzen": "Vertrag, Honorar und Rechnungsdaten.",
    Promotion: "Werbematerial und Ankündigungen.",
    "Verpflegung & Extras": "Backstage, Garderobe und Catering.",
    "Unterkunft & Anreise": "Hotel, Anfahrt und Besonderheiten.",
    "Dateien & Unterlagen": "Verträge, Pläne und weitere Unterlagen.",
    Sonstiges: "Alles, was sonst noch wichtig ist.",
    "Downloads & Materialien": "Materialien zur Vorbereitung.",
  };

  return descriptions[title] ?? "";
}

function formatDate(date?: string) {
  if (!date) return { day: "—", month: "", year: "" };

  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) {
    return { day: "—", month: "", year: "" };
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

function formatBytes(bytes?: number) {
  if (!bytes) return "Größe unbekannt";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Avatar({
  initials,
  small = false,
}: {
  initials: string;
  small?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full border-2 border-white bg-zinc-900 font-black text-white ${
        small ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"
      }`}
    >
      {initials}
    </div>
  );
}

function Doodle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`pointer-events-none absolute select-none font-black leading-none opacity-60 ${className}`}
    >
      {children}
    </span>
  );
}

function HeroPill({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100">
      {children}
    </div>
  );
}

function Status({
  label,
  value,
  done,
  variant = "amber",
}: {
  label: string;
  value?: string;
  done?: boolean;
  variant?: "amber" | "purple";
}) {
  const text = value || (done ? "Erledigt" : "Offen");
  const styles = done
    ? "bg-emerald-100 text-emerald-700"
    : variant === "purple"
      ? "bg-purple-100 text-purple-700"
      : "bg-orange-100 text-orange-700";

  return (
    <div className="flex items-center justify-between border-b border-white/70 pb-3 text-sm last:border-0 last:pb-0">
      <span className="font-bold text-zinc-800">{label}</span>
      <span className={`rounded-full px-3 py-1 text-xs font-black ${styles}`}>
        {text}
      </span>
    </div>
  );
}

function Input({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder?: string;
  value?: string | boolean;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className={FIELD_LABEL}>
      {label}
      <input
        type={type}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={FIELD_CONTROL}
      />
    </label>
  );
}

function Textarea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder?: string;
  value?: string | boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className={FIELD_LABEL}>
      {label}
      <textarea
        rows={4}
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={FIELD_TEXTAREA}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options = ["Ja", "Nein", "Noch offen", "Nicht relevant"],
}: {
  label: string;
  value?: string | boolean;
  onChange: (value: string) => void;
  options?: string[];
}) {
  return (
    <label className={FIELD_LABEL}>
      {label}
      <select
        value={typeof value === "string" ? value : ""}
        onChange={(e) => onChange(e.target.value)}
        className={FIELD_CONTROL}
      >
        <option value="">Bitte auswählen</option>
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked?: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition hover:bg-white/90 ${
        checked ? "text-zinc-950 shadow-sm" : "text-zinc-600"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full border-2 ${
          checked ? "border-purple-500 bg-purple-500" : "border-zinc-300"
        }`}
      />
      {label}
    </button>
  );
}