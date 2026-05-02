module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/primakavi-show-portal/app/favicon.ico (static in ecmascript, tag client)", ((__turbopack_context__) => {

__turbopack_context__.v("/_next/static/media/favicon.0x3dzn~oxb6tn.ico" + (globalThis["NEXT_CLIENT_ASSET_SUFFIX"] || ''));}),
"[project]/primakavi-show-portal/app/favicon.ico.mjs { IMAGE => \"[project]/primakavi-show-portal/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/favicon.ico (static in ecmascript, tag client)");
;
const __TURBOPACK__default__export__ = {
    src: __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$favicon$2e$ico__$28$static__in__ecmascript$2c$__tag__client$29$__["default"],
    width: 256,
    height: 256
};
}),
"[project]/primakavi-show-portal/app/lib/supabase/server.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createClient",
    ()=>createClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/@supabase/ssr/dist/module/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/@supabase/ssr/dist/module/createServerClient.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/headers.js [app-rsc] (ecmascript)");
;
;
async function createClient() {
    const cookieStore = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cookies"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createServerClient"])(("TURBOPACK compile-time value", "https://wvhidzyzukbrkpuicckf.supabase.co"), ("TURBOPACK compile-time value", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2aGlkenl6dWticmtwdWljY2tmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NzI4NzQsImV4cCI6MjA5MTU0ODg3NH0.QEGBUvK-DveuOzF8cR7BeShYpkOnWlyuQ1ShoPeR44g"), {
        cookies: {
            getAll () {
                return cookieStore.getAll();
            },
            setAll (cookiesToSet) {
                try {
                    cookiesToSet.forEach(({ name, value, options })=>cookieStore.set(name, value, options));
                } catch  {}
            }
        }
    });
}
}),
"[project]/primakavi-show-portal/app/lib/show-workflow.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "daysUntil",
    ()=>daysUntil,
    "formatDate",
    ()=>formatDate,
    "getNextAction",
    ()=>getNextAction,
    "getOpenChecklistCount",
    ()=>getOpenChecklistCount,
    "getTodayISO",
    ()=>getTodayISO,
    "getWorkflowLevel",
    ()=>getWorkflowLevel
]);
function getTodayISO() {
    return new Date().toISOString().slice(0, 10);
}
function daysUntil(date) {
    if (!date) return null;
    const today = new Date(getTodayISO());
    const target = new Date(date);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}
function getOpenChecklistCount(checklist) {
    if (!checklist) return 0;
    if (Array.isArray(checklist)) {
        return checklist.filter((item)=>!item.done).length;
    }
    if (typeof checklist === "object") {
        return Object.values(checklist).filter((value)=>value === false).length;
    }
    return 0;
}
function getWorkflowLevel(show) {
    const internalStatus = show.show_admin_notes?.internal_status;
    const billingStatus = show.show_admin_notes?.billing_status;
    const followUpDate = show.show_admin_notes?.follow_up_date;
    const checklist = show.show_admin_notes?.checklist;
    const daysToShow = daysUntil(show.show_date);
    const daysToFollowUp = daysUntil(followUpDate);
    const openChecklist = getOpenChecklistCount(checklist);
    if (internalStatus === "archiviert" || internalStatus === "abgeschlossen") {
        return "archived";
    }
    if (daysToFollowUp !== null && daysToFollowUp <= 0) {
        return "urgent";
    }
    if (daysToShow !== null && daysToShow <= 14 && daysToShow >= 0 && openChecklist > 0) {
        return "urgent";
    }
    if (billingStatus === "offen" && daysToShow !== null && daysToShow < 0) {
        return "urgent";
    }
    if (internalStatus === "wartet_auf_veranstalter") {
        return "warning";
    }
    if (openChecklist > 0) {
        return "warning";
    }
    return "ok";
}
function getNextAction(show) {
    const admin = show.show_admin_notes;
    const details = show.show_details;
    if (admin?.next_step) return admin.next_step;
    if (!details?.contact_email) return "Kontakt ergänzen";
    if (!details?.venue_address) return "Adresse ergänzen";
    if (!details?.schedule) return "Ablauf klären";
    if (!details?.technik) return "Technikdaten nachfassen";
    if (!details?.vertrag) return "Vertrag prüfen";
    if (!details?.tickets) return "Ticketlink ergänzen";
    if (admin?.billing_status === "offen") return "Abrechnung erledigen";
    return "Keine offene Aktion";
}
function formatDate(date) {
    if (!date) return "ohne Datum";
    return new Intl.DateTimeFormat("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(new Date(date));
}
}),
"[project]/primakavi-show-portal/app/markus/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/primakavi-show-portal/app/markus/page.tsx', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/primakavi-show-portal/app/markus/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/primakavi-show-portal/app/markus/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0ib09~h._.js.map