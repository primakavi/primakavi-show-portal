"use client";


import { useMemo, useState } from "react";


type Props = {

  show: any;

  venueName?: string;

  venueCity?: string;

  castDisplay?: string;

  hasMarkus?: boolean;

};


const WEEKDAYS = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"];


function dateParts(value?: string | null) {

  if (!value) return { weekday: "–", dayMonth: "–", year: "–" };


  const [y, m, d] = String(value).split("-").map(Number);


  if (!y || !m || !d) {

    return { weekday: "–", dayMonth: "–", year: "–" };

  }


  const date = new Date(y, m - 1, d);


  return {

    weekday: WEEKDAYS[date.getDay()],

    dayMonth: `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.`,

    year: String(y),

  };

}


export default function WebsiteTicketsEditor({

  show,

  venueName = "",

  venueCity = "",

  castDisplay = "",

  hasMarkus = false,

}: Props) {

  const [ticketLink, setTicketLink] = useState(show.ticket_link || "");

  const [websiteVisible, setWebsiteVisible] = useState(

    show.website_visible === true

  );


  const [ticketStatus, setTicketStatus] = useState(

    show.free_entry === true
      ? "free_entry"
      : show.ticket_status || "available"

  );


  const [badge, setBadge] = useState(
    String(show.website_badge || "").trim().toUpperCase() === "EINTRITT FREI"
      ? ""
      : show.website_badge || ""
  );


  const date = useMemo(

    () => dateParts(show.show_date),

    [show.show_date]

  );


  const effectiveBadge = badge.trim();


  const timeLabel = show.start_time
    ? `${String(show.start_time).slice(0, 5)} UHR`
    : "";

  const castLabel =
    castDisplay.trim() ||
    (hasMarkus ? "MARKUS SCHELL" : "");

  const meta = [

    venueName,

    venueCity,

    timeLabel,

    castLabel ? `MIT ${castLabel}` : "",

  ]

    .filter(Boolean)

    .join(" · ");


  /*

   * ---------------------------------------------------------

   * BUTTON / TICKETSTATUS IN DER WEBSITE-VORSCHAU

   * ---------------------------------------------------------

   */


  const actionLabel =
    ticketStatus === "sold_out"
      ? "AUSVERKAUFT"
      : ticketStatus === "low_stock"
        ? "RESTKARTEN"
        : ticketStatus === "free_entry"
          ? "EINTRITT FREI"
          : ticketStatus === "info_pending"
            ? "INFOS FOLGEN"
            : ticketLink.trim()
              ? "TICKETS"
              : "INFOS FOLGEN";

  const actionIsStatus =
    ticketStatus === "sold_out" ||
    ticketStatus === "low_stock" ||
    ticketStatus === "free_entry";

  const freeEntry = ticketStatus === "free_entry";

  return (

    <div className="space-y-5">


      {/* =====================================================

          BEARBEITUNG

          \===================================================== */}


      <div className="grid gap-3 md:grid-cols-2">


        {/* Ticketlink */}


        <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">

          Ticketlink / Info-Link


          <input

            name="ticket_link"

            value={ticketLink}

            onChange={(e) =>

              setTicketLink(e.target.value)

            }

            placeholder="https://…"

            className="

              h-11

              w-full

              rounded-xl

              border

              border-zinc-300

              bg-white

              px-3

              text-sm

              font-bold

              text-zinc-900

              outline-none

              transition

              focus:border-zinc-400

            "

          />

        </label>


        {/* Ticketstatus */}


        <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">

          Ticketstatus


          <select

            name="ticket_status"

            value={ticketStatus}

            onChange={(e) =>

              setTicketStatus(e.target.value)

            }

            className="

              h-11

              w-full

              rounded-xl

              border

              border-zinc-300

              bg-white

              px-3

              text-sm

              font-bold

              text-zinc-900

              outline-none

              transition

              focus:border-zinc-400

            "

          >

            <option value="available">

              Im Verkauf

            </option>


            <option value="low_stock">

              Restkarten

            </option>


            <option value="sold_out">

              Ausverkauft

            </option>

            <option value="free_entry">

              Eintritt frei

            </option>


            <option value="info_pending">

              Infos folgen

            </option>

          </select>

        </label>


        {/* Website-Badge */}


        <label className="grid gap-1.5 text-[11px] font-semibold text-zinc-500">

          Website-Badge


          <input

            name="website_badge"

            value={badge}

            onChange={(e) =>

              setBadge(e.target.value)

            }

            placeholder="z. B. PREMIERE, ZUSATZSHOW, SPECIAL"

            className="

              h-11

              w-full

              rounded-xl

              border

              border-zinc-300

              bg-white

              px-3

              text-sm

              font-bold

              text-zinc-900

              outline-none

              transition

              focus:border-zinc-400

            "

          />

        </label>


        <input
          type="hidden"
          name="free_entry"
          value={freeEntry ? "on" : ""}
        />


        {/* Homepage */}
        <div className="grid gap-1.5">
          {/* Exakt dieselbe Label-Zeile wie beim Website-Badge */}
          <div
            className="invisible text-[11px] font-semibold text-zinc-500"
            aria-hidden="true"
          >
            Website-Badge
          </div>

          <label
            className={`
              flex
              h-11
              cursor-pointer
              items-center
              gap-3
              rounded-xl
              border
              px-4
              text-sm
              font-black
              transition
              ${
                websiteVisible
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-zinc-300 bg-white text-zinc-700"
              }
            `}
          >
            <input
              type="checkbox"
              name="website_visible"
              checked={websiteVisible}
              onChange={(e) => setWebsiteVisible(e.target.checked)}
              className="h-4 w-4"
            />

            Auf Homepage veröffentlichen
          </label>
        </div>


      </div>


      {/* =====================================================

          WEBSITE-VORSCHAU

          \===================================================== */}


      <div className="border-t border-zinc-200 pt-5">


        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">


          <div>

            <div className="text-[11px] font-black uppercase tracking-[.16em] text-zinc-400">

              Vorschau auf sonja-gruendemann.de

            </div>


            <div className="mt-1 text-xs font-semibold text-zinc-500">

              So erscheint der Termin im Bereich „Live“.

            </div>

          </div>


          {!websiteVisible && (

            <span className="rounded-full bg-amber-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-amber-700 ring-1 ring-amber-200">

              Nicht veröffentlicht

            </span>

          )}


        </div>


        <div

          className={`

            overflow-x-auto

            rounded-2xl

            p-3

            ring-1

            ring-black/5

            ${

              websiteVisible

                ? "bg-[#d38fb3]"

                : "bg-[#d38fb3] opacity-55"

            }

          `}

        >


          <div className="grid min-w-[680px] grid-cols-[106px_minmax(0,1fr)_154px] gap-[12px]">


            {/* Datum */}


            <div className="flex min-h-[64px] w-[106px] flex-col items-center justify-center rounded-l-[13px] border-2 border-[#b45989]/50 px-2 py-2 text-white">


              <span className="text-[9px] font-medium uppercase tracking-[4px] opacity-80">

                {date.weekday}

              </span>


              <span className="mt-1 text-[21px] font-normal leading-none tracking-[1.5px]">

                {date.dayMonth}

              </span>


              <span className="mt-[5px] text-[8px] tracking-[2.5px] opacity-65">

                {date.year}

              </span>


            </div>


            {/* Show */}

          <div className="flex min-h-[64px] min-w-0 flex-col justify-center bg-gradient-to-r from-[#c36a9a] via-[#b65387] to-[#c16b99] py-[8px] pl-[18px] pr-[18px] text-white">

            <div className="flex min-w-0 items-center gap-3">
              <div className="min-w-0 truncate text-[19px] font-normal uppercase leading-[1.05] tracking-[4px]">
                {show.program || "PROGRAMM OFFEN"}
              </div>

              {effectiveBadge && (
                <span className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-[#f3dce8] px-3 py-1.5 text-[9px] font-bold uppercase leading-none tracking-[1.2px] text-[#b45989]">
                  {effectiveBadge}
                </span>
              )}
            </div>

            <div className="mt-[7px] truncate text-[10px] font-normal uppercase leading-[1.3] tracking-[2.5px]">
              {meta || "SPIELSTÄTTE · ORT"}
            </div>

          </div>


          {/* Ticket / Status */}

          <div className="flex min-h-[64px] items-center justify-center rounded-r-[13px] border-2 border-[#b45989]/50 px-3 text-center uppercase leading-tight text-white">

            {actionIsStatus ? (
              <span
                className={`
                  inline-flex min-h-[40px] min-w-[138px] -rotate-3
                  items-center justify-center whitespace-nowrap rounded-lg
                  px-3.5 py-2.5 text-[12px] font-extrabold leading-none
                  tracking-[1.3px] shadow-md
                  ${
                    ticketStatus === "sold_out"
                      ? "bg-[#b45989] text-white"
                      : "bg-[#e9ddc7] text-[#1c1c1c]"
                  }
                `}
              >
                {actionLabel}
              </span>
            ) : (
              <span className="text-[15px] font-normal tracking-[3px]">
                {actionLabel}
              </span>
            )}

          </div>

        </div>

      </div>

    </div>

  </div>

  );

}