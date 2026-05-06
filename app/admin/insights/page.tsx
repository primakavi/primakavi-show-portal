import Link from "next/link";

const wrappedCards = [
  ["Beste Show", "XY", "+1.840 € Gewinn"],
  ["Top Venue", "XY", "stärkste Marge"],
  ["Beste Region", "XY", "hohes Potenzial"],
  ["Kostenfalle", "XY", "prüfen vor Buchung"],
];

const insightCards = [
  "Welche Shows sich wirklich lohnen",
  "Welche Regionen besonders stark performen",
  "Welche Programme wirtschaftlich am besten laufen",
  "Welche Venues du erneut anfragen solltest",
  "Wo Kosten aus dem Ruder laufen",
  "Welche Tourcluster sinnvoll sind",
];

export default function InsightsPreviewPage() {
  return (
    <main className="min-h-screen bg-[#fbf7ef] px-4 py-6 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] bg-zinc-950 p-6 text-white shadow-xl sm:p-8 lg:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-pink-300">
                Preview
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
                Tour Insights
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-white/70 sm:text-base">
                Bald siehst du hier, welche Shows, Venues, Regionen und Programme
                wirtschaftlich wirklich funktionieren — wie ein Spotify Wrapped
                für deine Booking-Daten.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/50">
                Status
              </p>
              <p className="mt-2 text-lg font-black">Coming soon ✨</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {wrappedCards.map(([title, value, hint]) => (
            <div
              key={title}
              className="relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm"
            >
              <div className="absolute inset-0 bg-white/45 backdrop-blur-[2px]" />
              <div className="relative">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                  {title}
                </p>
                <p className="mt-4 text-2xl font-black tracking-tight text-zinc-950">
                  {value}
                </p>
                <p className="mt-2 text-sm font-bold text-zinc-500">{hint}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Wirtschaftlichkeit
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              Gewinnentwicklung
            </h2>

            <div className="mt-8 space-y-4 opacity-60">
              {[78, 52, 88, 64, 92, 70].map((width, index) => (
                <div key={index}>
                  <div className="mb-2 flex justify-between text-xs font-black text-zinc-400">
                    <span>Monat {index + 1}</span>
                    <span>Preview</span>
                  </div>
                  <div className="h-4 rounded-full bg-[#fbf7ef]">
                    <div
                      className="h-4 rounded-full bg-zinc-950"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-zinc-400">
              Empfehlungen
            </p>
            <h2 className="mt-3 text-2xl font-black tracking-tight">
              Was du später daraus ableitest
            </h2>

            <div className="mt-6 space-y-3">
              {insightCards.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-[#fbf7ef] px-4 py-3 text-sm font-black text-zinc-700"
                >
                  ✨ {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-dashed border-zinc-300 bg-white/60 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-black tracking-tight">
            Noch keine echten Auswertungen aktiv
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm font-bold leading-6 text-zinc-500">
            Diese Seite ist erstmal eine Vorschau. Sobald genug Shows sauber
            nachbereitet sind, können hier echte Analytics, Rankings,
            Tourcluster und Jahresvergleiche eingebaut werden.
          </p>

          <Link
            href="/admin/shows"
            className="mt-6 inline-flex rounded-full bg-zinc-950 px-5 py-3 text-sm font-black text-white transition hover:bg-zinc-800"
          >
            Zurück zu den Shows
          </Link>
        </section>
      </div>
    </main>
  );
}