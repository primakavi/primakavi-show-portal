import Link from "next/link";

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.38),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(190,255,90,0.13),transparent_28%)]" />
          <div className="absolute right-16 top-10 rotate-6 text-7xl text-pink-400 opacity-70">
            ?
          </div>

          <div className="relative max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-widest text-white/50">
              primakavi · hilfe
            </p>
            <h1 className="mt-4 text-5xl font-black tracking-tight">
              Show-System erklärt
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/70">
              Nach Themen sortiert — damit du schnell findest, was du gerade
              brauchst.
            </p>
          </div>
        </header>

        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
            Schnellstart
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <QuickStep title="Neue Show anlegen" href="/admin/shows">
              Alle Shows öffnen → „Neue Show-Akte +“ klicken → Daten ergänzen.
            </QuickStep>

            <QuickStep title="Show bearbeiten" href="/admin/shows">
              Show öffnen → Akte ändern → immer „Akte speichern“ klicken.
            </QuickStep>

            <QuickStep title="Formular schicken">
              In der Akte den Veranstalterformular-Link kopieren und per Mail
              senden.
            </QuickStep>

            <QuickStep title="Neue Infos prüfen">
              Meldung „Neue Infos“ prüfen → bestätigen → Akte speichern.
            </QuickStep>
          </div>
        </section>

        <Topic
          icon="📊"
          title="Dashboard"
          what="Das Dashboard ist dein schneller Einstieg ins System."
          useFor="Nutze es, wenn du wissen willst, was gerade wichtig ist: kommende Shows, offene Punkte und Aufgaben."
          steps={[
            "Dashboard öffnen.",
            "Überblick prüfen.",
            "Bei Bedarf in Shows oder Akten springen.",
          ]}
          important="Das Dashboard ist für Überblick gedacht, nicht für Detailarbeit."
        />

        <Topic
          icon="📋"
          title="Alle Shows"
          what="Alle Shows ist die zentrale Liste aller Veranstaltungen."
          useFor="Hier legst du Shows an, findest Termine schnell wieder und öffnest die jeweilige Show-Akte."
          steps={[
            "Oben mit „Neue Show-Akte +“ eine neue Show anlegen.",
            "In der Liste eine Show öffnen, um die Akte zu bearbeiten.",
            "Eine bestehende Show duplizieren, wenn eine ähnliche Show angelegt werden soll.",
            "Eine Show löschen, wenn sie nicht mehr gebraucht wird.",
            "Das Formular für Veranstalter direkt aus der Liste öffnen.",
          ]}
          important="Die Liste ist dein Steuerpult: schnell finden, öffnen, duplizieren, löschen oder zum Formular springen."
        />

        <Topic
          icon="🧾"
          title="Show-Akte"
          what="Die Show-Akte ist der wichtigste Arbeitsbereich. Hier liegen alle Infos zu einer Show an einem Ort."
          useFor="Nutze sie für Showdaten, Ablauf, Technik, Anreise, Unterkunft, Vertrag, Finanzen, Dateien, To-dos und interne Notizen."
          steps={[
            "Show aus der Liste öffnen.",
            "Daten in den Bereichen ergänzen oder ändern.",
            "Links To-dos, Notizen, „Markus dabei?“ und „Notizen für Markus“ prüfen.",
            "Verträge oder Dateien im Upload-Bereich hochladen.",
            "Checkliste für Vorbereitung, vor der Show und Nachbereitung nutzen.",
            "Am Ende immer „Akte speichern“ klicken.",
          ]}
          important="Änderungen sind erst sicher gespeichert, wenn du die Akte speicherst."
        />
<Topic
  icon="💰"
  title="Economics & Nachbereitung"
  what="Economics ist der Bereich für die wirtschaftliche Nachbereitung einer einzelnen Show."
  useFor="Nutze ihn, um Einnahmen, Kosten, Ticketzahlen, Bewertung und Learnings nach der Show sauber zu dokumentieren."
  steps={[
    "Show öffnen und den Bereich Economics/Nachbereitung aufrufen.",
    "Einnahmen und Kosten als einzelne Positionen eintragen.",
    "Ticketzahlen und relevante Zusatzinfos ergänzen.",
    "Gewinn, Kosten und Marge prüfen.",
    "Bewertung, Learnings und Fazit zur Show festhalten.",
    "Am Ende speichern.",
  ]}
  important="Economics bewertet immer diese eine Show. Die große Auswertungsseite für Trends, Regionen, Venues und Programme kommt später separat."
/>
        <Topic
          icon="📨"
          title="Veranstalterformular"
          what="Das Formular ist für Veranstalter gedacht und funktioniert ohne Login."
          useFor="Damit Veranstalter Showdaten ergänzen und Dateien hochladen können."
          steps={[
            "Show-Akte öffnen.",
            "Link zum Veranstalterformular kopieren oder über „Mail kopieren“ versenden.",
            "Veranstalter trägt Daten ein und lädt ggf. Dateien hoch.",
            "Die Daten werden automatisch gespeichert und die Akte aktualisiert.",
            "Bei „Neue Infos“: prüfen, bestätigen und Akte speichern.",
          ]}
          important="Beim ersten Öffnen wird das Formular aus der Akte befüllt. Neue Angaben können später wieder zurück in die Akte fließen."
        />

        <Topic
          icon="🗺️"
          title="Tourkarte"
          what="Die Tourkarte zeigt Shows auf einer Karte und sortiert sie nach Datum."
          useFor="Nutze sie, um Strecken, Regionen und Lücken zwischen Shows zu erkennen."
          steps={[
            "Tourkarte öffnen.",
            "Filter oder Zeitraum auswählen.",
            "Karte und linke Tour-Reihenfolge prüfen.",
            "Wenn neue Shows keine Pins haben: „Standorte laden“ klicken.",
          ]}
          important="Die Karte hilft beim Denken in Touren — nicht nur beim Anschauen von Orten."
        />

        <Topic
          icon="🎹"
          title="Markus-Ansicht"
          what="Die Markus-Ansicht ist eine reduzierte Read-only-Ansicht."
          useFor="Markus sieht nur seine relevanten Shows mit Ort, Zeiten, Piano- und Technikinfos."
          steps={[
            "Markus-Ansicht öffnen, um zu prüfen, was Markus sieht.",
            "Markus-Karte öffnen, um seine relevanten Shows auf der Karte zu sehen.",
            "In der Show-Akte steuerst du über „Markus dabei?“, ob eine Show dort erscheint.",
            "Notizen für Markus in der Akte pflegen.",
          ]}
          important="Markus hat keinen Zugriff auf die Show-Akte und kann nichts bearbeiten."
        />

        <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-pink-500">
            Häufige Fragen
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <FAQ
              question="Kann ich etwas kaputt machen?"
              answer="Nicht so schnell. Wichtig ist nur: Änderungen in der Akte immer speichern."
            />
            <FAQ
              question="Muss ein Veranstalter sich einloggen?"
              answer="Nein. Der Formularlink funktioniert ohne Login."
            />
            <FAQ
              question="Was bedeutet „Neue Infos“?"
              answer="Der Veranstalter hat etwas ergänzt oder geändert. Bitte prüfen, bestätigen und speichern."
            />
            <FAQ
              question="Warum sieht Markus weniger?"
              answer="Absicht. Markus bekommt nur seinen Tourplan und keine Bearbeitungsrechte."
            />
            <FAQ
  question="Wofür ist Economics gedacht?"
  answer="Für die Nachbereitung einer einzelnen Show: Einnahmen, Kosten, Gewinn, Marge, Bewertung und Learnings."
/>
<FAQ
  question="Wo kommen spätere Auswertungen hin?"
  answer="Nicht in die einzelne Show. Dafür ist später eine eigene Insights- oder Analytics-Seite geplant."
/>
          </div>
        </section>
      </div>
    </main>
  );
}

function QuickStep({
  title,
  children,
  href,
}: {
  title: string;
  children: React.ReactNode;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg hover:shadow-black/5">
      <p className="text-sm font-black text-zinc-950">{title}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-zinc-500">
        {children}
      </p>
      {href && (
        <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-pink-500">
          öffnen →
        </p>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function Topic({
  icon,
  title,
  what,
  useFor,
  steps,
  important,
}: {
  icon: string;
  title: string;
  what: string;
  useFor: string;
  steps: string[];
  important: string;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5">
      <div className="flex gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fbf7ef] text-2xl ring-1 ring-black/5">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-black tracking-tight text-zinc-950">
            {title}
          </h2>

          <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3 text-sm font-medium leading-7 text-zinc-600">
              <InfoLabel label="Was ist das?" text={what} />
              <InfoLabel label="Wofür nutze ich das?" text={useFor} />
            </div>

            <div className="rounded-[1.5rem] bg-[#fbf7ef] p-4 ring-1 ring-black/5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                So gehst du vor
              </p>

              <ol className="mt-3 space-y-2 text-sm font-semibold leading-6 text-zinc-600">
                {steps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="text-pink-500">→</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-pink-50 px-4 py-3 text-sm font-bold leading-6 text-pink-700 ring-1 ring-pink-100">
            {important}
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoLabel({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1">{text}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl bg-[#fbf7ef] p-4 ring-1 ring-black/5">
      <p className="font-black text-zinc-950">{question}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-zinc-500">
        {answer}
      </p>
    </div>
  );
}