module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/primakavi-show-portal/app/lib/supabaseAdmin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/@supabase/supabase-js/dist/index.mjs [app-route] (ecmascript) <locals>");
;
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wvhidzyzukbrkpuicckf.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
}),
"[project]/primakavi-show-portal/app/api/show/[token]/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/supabaseAdmin.ts [app-route] (ecmascript)");
;
;
async function GET(_request, { params }) {
    const { token } = await params;
    const { data: show, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").select("*").eq("token", token).single();
    if (error || !show) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error?.message || "Show nicht gefunden."
        }, {
            status: 404
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        show,
        form: createPortalForm(show)
    });
}
async function POST(request, { params }) {
    const { token } = await params;
    const body = await request.json();
    const { data: existing, error: existingError } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").select("*").eq("token", token).single();
    if (existingError || !existing) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: existingError?.message || "Show nicht gefunden."
        }, {
            status: 404
        });
    }
    const payload = buildShowUpdatePayload(body, existing);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").update(payload).eq("token", token).select("*").single();
    if (error) {
        console.error("Portal speichern fehlgeschlagen:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        show: data,
        form: createPortalForm(data)
    });
}
function createPortalForm(show) {
    const portalData = show.portal_data && typeof show.portal_data === "object" && !Array.isArray(show.portal_data) ? show.portal_data : {};
    return normalizePortalData({
        artist: show.artist,
        program: show.program,
        show_date: show.show_date,
        weekday: show.weekday,
        venue: show.venue,
        city: show.city,
        start_time: show.start_time,
        entry_time: show.entry_time,
        contact_name: show.contact_name,
        contact_email: show.contact_email,
        contact_phone: show.contact_phone,
        venue_address: show.venue_address,
        fee: show.fee,
        ticket_link: show.ticket_link,
        ticket_prices: show.ticket_prices,
        capacity: show.capacity,
        contract_status: show.contract_status,
        free_tickets: show.free_tickets,
        catering_status: show.catering_status,
        catering_details: show.catering_details,
        backstage_equipment: show.backstage_equipment,
        travel_details: show.travel_details,
        accommodation_type: show.accommodation_type,
        accommodation_notes: show.accommodation_notes,
        invoice_email: show.invoice_email,
        invoice_address: show.invoice_address,
        contract_notes: show.contract_notes,
        general_notes: show.general_notes,
        ...portalData
    });
}
function buildShowUpdatePayload(body, existing) {
    const showDate = str(body.show_date);
    const weekday = showDate ? getWeekday(showDate) : existing.weekday;
    const schedule = buildSchedule(body);
    const technik = buildTechnik(body);
    const promotion = buildPromotion(body);
    const anreise = buildAnreise(body);
    const unterkunft = buildUnterkunft(body);
    const checklist = buildChecklist(body);
    return {
        artist: keep(body.artist, existing.artist),
        program: keep(body.program, existing.program),
        show_date: showDate || existing.show_date || null,
        weekday,
        venue: keep(body.venue, existing.venue),
        city: keep(body.city, existing.city),
        start_time: keep(body.start_time, existing.start_time),
        entry_time: keep(body.entry_time, existing.entry_time),
        contact_name: keep(body.contact_name, existing.contact_name),
        contact_email: keep(body.contact_email, existing.contact_email),
        contact_phone: keep(body.contact_phone, existing.contact_phone),
        venue_address: keep(body.venue_address, existing.venue_address),
        schedule: schedule || existing.schedule || null,
        technik: technik || existing.technik || null,
        anreise: anreise || existing.anreise || null,
        unterkunft: unterkunft || existing.unterkunft || null,
        promotion: promotion || existing.promotion || null,
        general_notes: keep(body.general_notes, existing.general_notes),
        fee: keep(body.fee, existing.fee),
        ticket_link: keep(body.ticket_link, existing.ticket_link),
        ticket_prices: keep(body.ticket_prices, existing.ticket_prices),
        capacity: keep(body.capacity, existing.capacity),
        contract_status: keep(body.contract_status, existing.contract_status),
        free_tickets: keep(body.free_tickets, existing.free_tickets),
        catering_status: keep(body.catering_status, existing.catering_status),
        catering_details: keep(body.catering_details, existing.catering_details),
        backstage_equipment: keep(body.backstage_equipment, existing.backstage_equipment),
        travel_details: keep(body.travel_details, existing.travel_details),
        accommodation_type: keep(body.accommodation_type, existing.accommodation_type),
        accommodation_notes: keep(body.accommodation_notes ?? body.unterkunft, existing.accommodation_notes),
        invoice_email: keep(body.invoice_email, existing.invoice_email),
        invoice_address: keep(body.invoice_address, existing.invoice_address),
        contract_notes: keep(body.contract_notes, existing.contract_notes),
        portal_data: normalizePortalData(body),
        checklist
    };
}
function buildSchedule(body) {
    return joinLines([
        line("Aufbau/Soundcheck", body.soundcheck_time),
        line("Ankunft", body.arrival_time),
        line("Einlass", body.entry_time),
        line("Beginn", body.start_time),
        str(body.schedule)
    ]);
}
function buildTechnik(body) {
    return joinLines([
        line("Ton", body.sound_system),
        line("Licht", body.lights),
        line("Klavier/Flügel", body.piano),
        line("E-Piano", body.epiano),
        line("Marke/Modell", body.piano_notes),
        line("Technik-Ansprechpartner", body.tech_contact),
        str(body.technik),
        str(body.tech_notes)
    ]);
}
function buildPromotion(body) {
    return joinLines([
        line("Freikarten", body.free_tickets),
        line("Flyer", body.flyers_needed),
        line("Flyeranzahl", body.flyer_amount),
        line("Plakate", body.posters_needed),
        line("Plakatdetails", body.poster_details),
        str(body.promotion),
        str(body.promotion_notes)
    ]);
}
function buildAnreise(body) {
    return joinLines([
        str(body.anreise),
        str(body.travel_options),
        str(body.travel_details)
    ]);
}
function buildUnterkunft(body) {
    return joinLines([
        line("Unterkunft", body.accommodation_type),
        str(body.unterkunft),
        str(body.accommodation_notes)
    ]);
}
function buildChecklist(body) {
    const formularVollstaendig = !!str(body.program) && !!str(body.show_date) && !!str(body.venue) && !!str(body.city) && !!str(body.contact_name) && !!str(body.contact_email) && !!str(body.entry_time) && !!str(body.start_time) && (!!str(body.technik) || !!str(body.sound_system) || !!str(body.tech_notes)) && (!!str(body.anreise) || !!str(body.travel_details) || !!str(body.travel_options)) && (!!str(body.unterkunft) || !!str(body.accommodation_type) || !!str(body.accommodation_notes));
    const vertragGeklaert = isContractDone(str(body.contract_status));
    return {
        "Formular vollständig": formularVollstaendig,
        "Vertrag geklärt": vertragGeklaert,
        "Technik geprüft": !!str(body.technik) || !!str(body.sound_system),
        "Ablauf geprüft": !!str(body.entry_time) && !!str(body.start_time),
        "Promo verschickt": false,
        "Hotel/Anreise geklärt": !!str(body.accommodation_type) || !!str(body.travel_details),
        "Backstage / Catering geklärt": !!str(body.catering_status) || !!str(body.backstage_equipment),
        "Ankunft / Zugang geklärt": !!str(body.arrival_time) || !!str(body.soundcheck_time),
        "Markus informiert": false,
        "Rechnung vorbereitet": !!str(body.invoice_email) || !!str(body.invoice_address),
        "Rechnung geschickt": false,
        "Zahlung geprüft": false,
        "GEMA erledigt": false,
        "Show gespielt": false,
        "Feedback notiert": false,
        "Akte abgeschlossen": false
    };
}
function normalizePortalData(body) {
    const data = {};
    Object.entries(body).forEach(([key, value])=>{
        const clean = str(value);
        if (clean) data[key] = clean;
    });
    return data;
}
function keep(value, fallback) {
    const clean = str(value);
    if (clean) return clean;
    const oldValue = str(fallback);
    return oldValue || null;
}
function str(value) {
    if (value === null || value === undefined) return "";
    return String(value).trim();
}
function line(label, value) {
    const clean = str(value);
    return clean ? `${label}: ${clean}` : "";
}
function joinLines(lines) {
    return lines.filter(Boolean).join("\n");
}
function isContractDone(value) {
    const clean = value.toLowerCase();
    return clean.includes("liegt vor") || clean.includes("vorhanden") || clean.includes("unterschrieben") || clean.includes("erledigt");
}
function getWeekday(date) {
    const d = new Date(`${date}T00:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("de-DE", {
        weekday: "long"
    }).toUpperCase();
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0t_i.ia._.js.map