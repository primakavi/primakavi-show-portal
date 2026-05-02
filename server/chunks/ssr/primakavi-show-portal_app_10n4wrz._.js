module.exports = [
"[project]/primakavi-show-portal/app/lib/show-workflow.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>MarkusClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/show-workflow.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function MarkusClient({ shows }) {
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("alle");
    const [openIds, setOpenIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const today = new Date().toISOString().slice(0, 10);
    const filteredShows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return shows.filter((show)=>{
            const searchText = [
                show.venue,
                show.city,
                show.venue_address,
                show.program,
                show.technik,
                show.schedule,
                show.anreise,
                show.unterkunft,
                show.accommodation_type,
                show.accommodation_notes,
                show.markus_notes,
                show.catering_details,
                show.backstage_equipment
            ].filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = searchText.includes(query.toLowerCase());
            const isPast = show.show_date && show.show_date < today;
            const isFuture = !show.show_date || show.show_date >= today;
            const isDone = show.internal_status === "fertig" || show.internal_status === "abgeschlossen";
            const matchesFilter = filter === "alle" || filter === "kommend" && isFuture || filter === "vergangen" && isPast || filter === "offen" && !isDone || filter === "fertig" && isDone;
            return matchesSearch && matchesFilter;
        });
    }, [
        shows,
        query,
        filter,
        today
    ]);
    function toggle(id) {
        setOpenIds((current)=>current.includes(id) ? current.filter((item)=>item !== id) : [
                ...current,
                id
            ]);
    }
    function openAll() {
        setOpenIds(filteredShows.map((show)=>show.id));
    }
    function closeAll() {
        setOpenIds([]);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "px-6 py-8",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-[1120px] space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "relative overflow-hidden rounded-[2.4rem] bg-[#111] p-8 text-white shadow-xl shadow-black/10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.42),transparent_27%),radial-gradient(circle_at_30%_20%,rgba(255,145,60,0.32),transparent_35%),radial-gradient(circle_at_65%_90%,rgba(190,255,90,0.18),transparent_28%)]"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 76,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute -right-8 -top-8 h-44 w-44 rounded-full bg-pink-400/20 blur-2xl"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 78,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-lime-300/10 blur-2xl"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-8 top-7 rounded-[2rem] bg-white/10 px-6 py-5 text-center ring-1 ring-white/10 backdrop-blur",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-black uppercase tracking-wide text-white/45",
                                    children: "Shows"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 82,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-4xl font-black",
                                    children: filteredShows.length
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 85,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 81,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-8 right-48 text-6xl opacity-80",
                            children: "🎹"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 88,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-100 top-32 text-4xl opacity-80",
                            children: "🎵"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-40 right-75 text-3xl opacity-80",
                            children: "✨"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 94,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative max-w-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-black uppercase tracking-[0.28em] text-white/45",
                                    children: "Primakavi · Markus"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "mt-4 text-4xl font-black tracking-tight md:text-5xl",
                                    children: "Markus-Ansicht"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 103,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-4 max-w-xl text-sm leading-relaxed text-white/65",
                                    children: "Piano-fokussierte Übersicht aller relevanten Shows – reduziert und schnell lesbar."
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-7 flex flex-wrap gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroBadge, {
                                            children: "🎹 Piano-Fokus"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 113,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroBadge, {
                                            children: "Read only"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroBadge, {
                                            children: "Alle relevanten Shows"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 115,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 112,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 98,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                    lineNumber: 75,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white/90 p-5 shadow-sm ring-1 ring-black/5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                value: query,
                                onChange: (event)=>setQuery(event.target.value),
                                placeholder: "Suche nach Location, Stadt, Adresse, Programm, Technik...",
                                className: "min-h-14 w-full rounded-2xl border border-black/10 bg-[#fbf7ef] px-5 text-sm font-semibold outline-none placeholder:text-zinc-400 focus:border-black/25"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 122,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterButton, {
                                                active: filter === "alle",
                                                onClick: ()=>setFilter("alle"),
                                                children: "Alle"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 131,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterButton, {
                                                active: filter === "kommend",
                                                onClick: ()=>setFilter("kommend"),
                                                children: "Kommend"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 137,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterButton, {
                                                active: filter === "vergangen",
                                                onClick: ()=>setFilter("vergangen"),
                                                children: "Vergangen"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 143,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterButton, {
                                                active: filter === "offen",
                                                onClick: ()=>setFilter("offen"),
                                                children: "Offen"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 149,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FilterButton, {
                                                active: filter === "fertig",
                                                onClick: ()=>setFilter("fertig"),
                                                children: "Fertig"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 155,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                        lineNumber: 130,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniButton, {
                                                onClick: openAll,
                                                children: "Alle öffnen"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 164,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniButton, {
                                                onClick: closeAll,
                                                children: "Alle schließen"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                                lineNumber: 165,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                        lineNumber: 163,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 129,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                        lineNumber: 121,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                    lineNumber: 120,
                    columnNumber: 9
                }, this),
                filteredShows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-[2rem] bg-white p-10 text-center text-zinc-500 shadow-sm ring-1 ring-black/5",
                    children: "Keine passenden Shows für Markus gefunden."
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                    lineNumber: 172,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: filteredShows.map((show)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MarkusAccordion, {
                            show: show,
                            isOpen: openIds.includes(show.id),
                            onToggle: ()=>toggle(show.id),
                            today: today
                        }, show.id, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 178,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                    lineNumber: 176,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
            lineNumber: 74,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
function MarkusAccordion({ show, isOpen, onToggle, today }) {
    const isPast = show.show_date && show.show_date < today;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "rounded-[2rem] bg-white p-4 shadow-xl shadow-zinc-200/60 ring-1 ring-black/5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: onToggle,
                className: "w-full rounded-[1.6rem] bg-[#fbf7ef] p-5 text-left transition hover:bg-[#f7efe2]",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid gap-4 lg:grid-cols-[145px_1fr_220px_40px] lg:items-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xl font-black",
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$show$2d$workflow$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["formatDate"])(show.show_date)
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 215,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm font-bold text-zinc-500",
                                    children: show.weekday || "—"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 216,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 214,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-black text-zinc-950",
                                            children: show.venue || "Location offen"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 223,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800",
                                            children: "🎹 Markus"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 227,
                                            columnNumber: 15
                                        }, this),
                                        isPast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-zinc-100 px-3 py-1 text-xs font-black text-zinc-500",
                                            children: "vergangen"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 232,
                                            columnNumber: 17
                                        }, this),
                                        show.internal_status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-700",
                                            children: show.internal_status
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                            lineNumber: 238,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 222,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm font-bold text-zinc-500",
                                    children: [
                                        show.city || "Ort offen",
                                        " · ",
                                        show.program || "Programm offen"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 244,
                                    columnNumber: 13
                                }, this),
                                show.venue_address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-2 text-sm text-zinc-500",
                                    children: show.venue_address
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 249,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 221,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-2xl bg-white px-4 py-3 text-sm shadow-sm ring-1 ring-black/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "font-black text-zinc-950",
                                    children: [
                                        "Beginn: ",
                                        show.start_time || "—"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 256,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-zinc-500",
                                    children: [
                                        "Einlass: ",
                                        show.entry_time || "—"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                    lineNumber: 259,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 255,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-right text-3xl font-black text-zinc-400",
                            children: isOpen ? "−" : "+"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                            lineNumber: 264,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                    lineNumber: 213,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-4 rounded-[1.6rem] bg-[#fbf7ef] p-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid gap-3 md:grid-cols-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Adresse",
                                value: addressText(show)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 273,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Ablauf",
                                value: show.schedule
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 274,
                                columnNumber: 3
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Piano / Technik",
                                value: show.technik,
                                highlight: true
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 276,
                                columnNumber: 3
                            }, this),
                            show.markus_notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Notizen für Markus",
                                value: show.markus_notes,
                                highlight: true
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 279,
                                columnNumber: 5
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Anreise",
                                value: show.anreise || show.travel_details
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 286,
                                columnNumber: 3
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Unterkunft",
                                value: accommodationText(show)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 287,
                                columnNumber: 3
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Info, {
                                title: "Catering / Backstage",
                                value: cateringText(show)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                                lineNumber: 288,
                                columnNumber: 3
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                        lineNumber: 272,
                        columnNumber: 1
                    }, this),
                    "        "
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                lineNumber: 271,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 207,
        columnNumber: 5
    }, this);
}
function HeroBadge({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: "rounded-full bg-white/10 px-4 py-2 text-xs font-black text-white ring-1 ring-white/10",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 297,
        columnNumber: 5
    }, this);
}
function FilterButton({ children, active, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: [
            "rounded-full px-4 py-3 text-sm font-black transition",
            active ? "bg-black text-white shadow-lg shadow-black/10" : "bg-[#fbf7ef] text-zinc-700 hover:bg-zinc-100"
        ].join(" "),
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 313,
        columnNumber: 5
    }, this);
}
function MiniButton({ children, onClick }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onClick,
        className: "rounded-full bg-zinc-100 px-4 py-3 text-sm font-black text-zinc-700 transition hover:bg-zinc-200",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 336,
        columnNumber: 5
    }, this);
}
function Info({ title, value, highlight = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: [
            "rounded-3xl p-4 ring-1 ring-black/5",
            highlight ? "bg-lime-50" : "bg-white"
        ].join(" "),
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-black uppercase tracking-wide text-zinc-400",
                children: title
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                lineNumber: 362,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700",
                children: value || "—"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
                lineNumber: 365,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/markus/MarkusClient.tsx",
        lineNumber: 356,
        columnNumber: 5
    }, this);
}
function addressText(show) {
    return [
        show.venue,
        show.venue_address,
        show.city
    ].filter(Boolean).join("\n") || null;
}
function cateringText(show) {
    return [
        show.catering_status,
        show.catering_details,
        show.backstage_equipment
    ].filter(Boolean).join("\n") || null;
}
function accommodationText(show) {
    const values = [
        show.accommodation_type,
        show.accommodation_notes,
        show.unterkunft
    ].filter(Boolean).map((value)=>String(value).replace(/^Unterkunft:\s*/i, "").trim()).filter(Boolean);
    return Array.from(new Set(values)).join("\n") || null;
}
}),
];

//# sourceMappingURL=primakavi-show-portal_app_10n4wrz._.js.map