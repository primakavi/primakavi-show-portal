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
"[project]/primakavi-show-portal/app/admin/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminDashboardPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/lib/supabase/server'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/show-workflow.ts [app-rsc] (ecmascript)");
;
;
;
;
async function AdminDashboardPage({ searchParams }) {
    const supabase = await createClient();
    let query = supabase.from("shows").select(`
      *,
      show_details (*),
      show_admin_notes (*)
    `).order("show_date", {
        ascending: true
    });
    if (searchParams?.year) {
        query = query.gte("show_date", `${searchParams.year}-01-01`).lte("show_date", `${searchParams.year}-12-31`);
    }
    const { data: shows, error } = await query;
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-600",
                children: "Fehler beim Laden der Shows."
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 41,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
            lineNumber: 40,
            columnNumber: 7
        }, this);
    }
    const search = searchParams?.q?.toLowerCase() ?? "";
    const filteredShows = (shows ?? []).filter((show)=>{
        if (!search) return true;
        return [
            show.venue,
            show.city,
            show.artist,
            show.program,
            show.show_details?.contact_name
        ].filter(Boolean).some((value)=>String(value).toLowerCase().includes(search));
    });
    const activeShows = filteredShows.filter((show)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkflowLevel"])(show) !== "archived");
    const urgentShows = activeShows.filter((show)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkflowLevel"])(show) === "urgent");
    const upcomingShows = activeShows.filter((show)=>{
        if (!show.show_date) return false;
        return new Date(show.show_date) >= new Date(new Date().toDateString());
    });
    const billingShows = filteredShows.filter((show)=>show.show_admin_notes?.billing_status === "offen" || show.show_admin_notes?.billing_status === "rechnung_raus");
    const archivedShows = filteredShows.filter((show)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkflowLevel"])(show) === "archived");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-neutral-50 p-6",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-7xl space-y-8",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "flex flex-col gap-4 md:flex-row md:items-end md:justify-between",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm font-medium text-neutral-500",
                                    children: "primakavi Show Portal"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 90,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold tracking-tight text-neutral-950",
                                    children: "Arbeitscockpit"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 93,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-neutral-600",
                                    children: "Alles, was heute wichtig ist – ohne Listen-Chaos."
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 89,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            href: "/admin/shows/new",
                            className: "rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-neutral-800",
                            children: "Neue Show anlegen"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 88,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    className: "grid gap-3 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-200 md:grid-cols-[1fr_160px_120px]",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            name: "q",
                            defaultValue: searchParams?.q ?? "",
                            placeholder: "Suche nach Venue, Stadt, Artist, Kontakt...",
                            className: "rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-500"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 110,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            name: "year",
                            defaultValue: searchParams?.year ?? "",
                            placeholder: "Jahr",
                            className: "rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-neutral-500"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 117,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "rounded-2xl bg-neutral-950 px-4 py-3 text-sm font-semibold text-white",
                            children: "Filtern"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 124,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 109,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "grid gap-4 md:grid-cols-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardStat, {
                            label: "Heute wichtig",
                            value: urgentShows.length
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardStat, {
                            label: "Kommende Shows",
                            value: upcomingShows.length
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 131,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardStat, {
                            label: "Abrechnung",
                            value: billingShows.length
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(DashboardStat, {
                            label: "Archiv",
                            value: archivedShows.length
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 133,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 129,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                            title: "🔥 Heute wichtig",
                            description: "Shows mit Handlungsdruck, offenen Punkten oder fälligem Follow-up."
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 137,
                            columnNumber: 11
                        }, this),
                        urgentShows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyState, {
                            text: "Gerade nichts Dringendes. Sehr schön."
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 143,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 lg:grid-cols-2",
                            children: urgentShows.map((show)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ShowActionCard, {
                                    show: show
                                }, show.id, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 147,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 145,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 136,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                            title: "📅 Kommende Shows",
                            description: "Der operative Blick auf die nächsten Veranstaltungen."
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 154,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 lg:grid-cols-3",
                            children: upcomingShows.map((show)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactShowCard, {
                                    show: show
                                }, show.id, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 161,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 159,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 153,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "space-y-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SectionHeader, {
                            title: "💰 Abrechnung",
                            description: "Alles, was nach der Show noch Geld oder Klärung braucht."
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 167,
                            columnNumber: 11
                        }, this),
                        billingShows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(EmptyState, {
                            text: "Keine offenen Abrechnungsthemen."
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 173,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 lg:grid-cols-2",
                            children: billingShows.map((show)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactShowCard, {
                                    show: show
                                }, show.id, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                    lineNumber: 177,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                    lineNumber: 166,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
            lineNumber: 87,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 86,
        columnNumber: 5
    }, this);
}
function DashboardStat({ label, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-neutral-500",
                children: label
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 190,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 text-3xl font-bold text-neutral-950",
                children: value
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 191,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 189,
        columnNumber: 5
    }, this);
}
function SectionHeader({ title, description }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-bold text-neutral-950",
                children: title
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-neutral-500",
                children: description
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 206,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 204,
        columnNumber: 5
    }, this);
}
function EmptyState({ text }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-3xl border border-dashed border-neutral-300 bg-white p-8 text-center text-neutral-500",
        children: text
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 213,
        columnNumber: 5
    }, this);
}
function ShowActionCard({ show }) {
    const openChecklist = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getOpenChecklistCount"])(show.show_admin_notes?.checklist);
    const nextAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNextAction"])(show);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "rounded-3xl bg-white p-5 shadow-sm ring-1 ring-red-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-medium text-red-600",
                                children: "Handlung nötig"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                lineNumber: 227,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mt-1 text-lg font-bold text-neutral-950",
                                children: show.venue
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                lineNumber: 228,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-500",
                                children: [
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatDate"])(show.show_date),
                                    " · ",
                                    show.city,
                                    " · ",
                                    show.program
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                lineNumber: 231,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 226,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700",
                        children: [
                            openChecklist,
                            " offen"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 236,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 225,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 rounded-2xl bg-neutral-50 p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-semibold uppercase tracking-wide text-neutral-500",
                        children: "Nächster Schritt"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 242,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 font-medium text-neutral-950",
                        children: nextAction
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 245,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 241,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-5 flex flex-wrap gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/admin/shows/${show.id}`,
                        className: "rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white",
                        children: "Akte öffnen"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: `mailto:${show.show_details?.contact_email ?? ""}`,
                        className: "rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800",
                        children: "Mail vorbereiten"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 256,
                        columnNumber: 9
                    }, this),
                    show.token && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: `/show/${show.token}`,
                        className: "rounded-xl bg-neutral-100 px-4 py-2 text-sm font-semibold text-neutral-800",
                        children: "Portal"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 264,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 224,
        columnNumber: 5
    }, this);
}
function CompactShowCard({ show }) {
    const level = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getWorkflowLevel"])(show);
    const nextAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNextAction"])(show);
    const badge = level === "urgent" ? "bg-red-50 text-red-700" : level === "warning" ? "bg-yellow-50 text-yellow-700" : "bg-green-50 text-green-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        href: `/admin/shows/${show.id}`,
        className: "block rounded-3xl bg-white p-5 shadow-sm ring-1 ring-neutral-200 transition hover:-translate-y-0.5 hover:shadow-md",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-start justify-between gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "font-bold text-neutral-950",
                                children: show.venue
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                lineNumber: 294,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-neutral-500",
                                children: [
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["formatDate"])(show.show_date),
                                    " · ",
                                    show.city
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                                lineNumber: 295,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 293,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `rounded-full px-3 py-1 text-xs font-semibold ${badge}`,
                        children: level
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                        lineNumber: 300,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 292,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-3 text-sm text-neutral-700",
                children: show.program
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 305,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-4 rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-600",
                children: nextAction
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
                lineNumber: 307,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/page.tsx",
        lineNumber: 288,
        columnNumber: 5
    }, this);
}
}),
"[project]/primakavi-show-portal/app/admin/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/primakavi-show-portal/app/admin/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0v.g9.j._.js.map