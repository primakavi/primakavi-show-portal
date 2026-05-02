module.exports = [
"[project]/primakavi-show-portal/app/admin/AdminClient.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminClient
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/client/app-dir/link.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
;
function AdminClient({ shows, createShowAction, deleteShowAction, duplicateShowAction }) {
    const [query, setQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [filter, setFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("alle");
    const [year, setYear] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("alle");
    const [showCreate, setShowCreate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const today = startOfToday();
    const years = Array.from(new Set(shows.map((show)=>show.show_date?.slice(0, 4)).filter(Boolean))).sort();
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return shows.filter((show)=>{
            const status = getStatus(show);
            const date = parseDate(show.show_date);
            const isPast = date ? date < today : false;
            const isFuture = date ? date >= today : true;
            const isArchived = show.internal_status === "abgeschlossen" || show.internal_status === "archiv" || show.internal_status === "archiviert";
            const text = [
                show.artist,
                show.program,
                show.venue,
                show.city,
                show.token,
                show.contact_name,
                show.contact_email,
                show.venue_address
            ].filter(Boolean).join(" ").toLowerCase();
            const matchesSearch = text.includes(query.toLowerCase());
            const matchesYear = year === "alle" || show.show_date?.startsWith(year);
            const matchesFilter = filter === "alle" || filter === "aktiv" && !isArchived || filter === "kommend" && isFuture && !isArchived || filter === "entwurf" && !show.show_date || filter === "vergangen_offen" && isPast && !isArchived || filter === "abrechnung" && isPast && show.billing_status !== "bezahlt" || filter === "markus" && show.markus_included === true || filter === "archiv" && isArchived || status.key === filter;
            return matchesSearch && matchesYear && matchesFilter;
        });
    }, [
        shows,
        query,
        filter,
        year,
        today
    ]);
    const grouped = groupByMonth(rows);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "relative overflow-hidden rounded-[2.4rem] bg-[#101014] p-10 text-white shadow-2xl shadow-black/10",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(255,105,180,0.38),transparent_28%),radial-gradient(circle_at_35%_25%,rgba(255,145,60,0.28),transparent_35%),radial-gradient(circle_at_70%_95%,rgba(190,255,90,0.13),transparent_28%)]"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 128,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-146 top-18 text-6xl text-pink-400",
                            children: "♕"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 129,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute top-8 right-24 text-5xl text-orange-300",
                            children: "★"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 130,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-bold uppercase tracking-widest text-white/50",
                                            children: "primakavi · show admin"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 134,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "mt-4 text-5xl font-black tracking-tight",
                                            children: "Alle Shows"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 137,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-4 max-w-xl text-white/70",
                                            children: "Shows verwalten, Akten öffnen und Portale verschicken."
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 140,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 133,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setShowCreate((prev)=>!prev),
                                    className: "rounded-3xl bg-gradient-to-r from-pink-400 to-orange-400 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02]",
                                    children: showCreate ? "Schließen ×" : "Neue Show +"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 145,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 132,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 127,
                    columnNumber: 9
                }, this),
                showCreate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5 ring-1 ring-black/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-black",
                            children: "Neue Show anlegen"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 157,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            action: createShowAction,
                            className: "mt-5 grid gap-4 md:grid-cols-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "artist",
                                    label: "Artist",
                                    defaultValue: "Sonja Gründemann"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "program",
                                    label: "Programm",
                                    placeholder: "Jetzt mal Tacheles"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "show_date",
                                    label: "Datum",
                                    type: "date"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "venue",
                                    label: "Location",
                                    placeholder: "Schatzkistl"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 166,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "city",
                                    label: "Stadt",
                                    placeholder: "Mannheim"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 167,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "entry_time",
                                    label: "Einlass",
                                    placeholder: "19:00 Uhr"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 168,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "start_time",
                                    label: "Showbeginn",
                                    placeholder: "20:00 Uhr"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 169,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "self-end rounded-2xl bg-zinc-950 px-5 py-4 font-black text-white shadow-lg",
                                    children: "Erstellen →"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 171,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 156,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 lg:grid-cols-[1fr_auto]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: query,
                                    onChange: (event)=>setQuery(event.target.value),
                                    placeholder: "Suche nach Location, Stadt, Programm, Kontakt...",
                                    className: "h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: year,
                                    onChange: (event)=>setYear(event.target.value),
                                    className: "h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-black outline-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "alle",
                                            children: "Alle Jahre"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 195,
                                            columnNumber: 15
                                        }, this),
                                        years.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: item,
                                                children: item
                                            }, item, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                lineNumber: 197,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 190,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 182,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex flex-wrap gap-2",
                            children: FILTERS.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setFilter(item.key),
                                    className: [
                                        "rounded-full px-4 py-2 text-sm font-black transition",
                                        filter === item.key ? "bg-zinc-950 text-white shadow-lg shadow-black/10" : "bg-[#fbf7ef] text-zinc-700 hover:bg-[#f5ead9]"
                                    ].join(" "),
                                    children: item.label
                                }, item.key, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 206,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 204,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 181,
                    columnNumber: 9
                }, this),
                rows.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-10 text-center shadow-xl shadow-black/5 ring-1 ring-black/5",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-black",
                        children: "Keine Shows gefunden."
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                        lineNumber: 225,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 224,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "space-y-5",
                    children: Object.entries(grouped).map(([month, monthShows])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5 ring-1 ring-black/5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-4 flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                            className: "text-2xl font-black",
                                            children: month
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 235,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "rounded-full bg-[#fbf7ef] px-3 py-1 text-xs font-black text-zinc-500",
                                            children: [
                                                monthShows.length,
                                                " Show",
                                                monthShows.length === 1 ? "" : "s"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 236,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 234,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: monthShows.map((show)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShowCard, {
                                            show: show,
                                            deleteShowAction: deleteShowAction,
                                            duplicateShowAction: duplicateShowAction
                                        }, show.id, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 243,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 241,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, month, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 230,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 228,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
            lineNumber: 126,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 125,
        columnNumber: 5
    }, this);
}
function ShowCard({ show, deleteShowAction, duplicateShowAction }) {
    const status = getStatus(show);
    const missing = getMissingFields(show);
    const isPast = isPastDate(show.show_date);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
        className: "relative overflow-hidden rounded-3xl bg-[#fbf7ef] p-5 transition hover:-translate-y-0.5 hover:bg-[#f5ead9]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid gap-4 md:grid-cols-[130px_1fr_175px_170px] md:items-top",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-lg font-black",
                            children: formatDate(show.show_date)
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 277,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-xs font-bold text-zinc-500",
                            children: show.start_time || "Uhrzeit offen"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 278,
                            columnNumber: 11
                        }, this),
                        isPast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 inline-flex rounded-full bg-white px-2 py-1 text-[11px] font-black text-zinc-500",
                            children: "vergangen"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 282,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 276,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "min-w-0",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap items-center gap-2",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "truncate text-xl font-black",
                                children: show.venue || "Location offen"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                lineNumber: 290,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 289,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-semibold text-zinc-500",
                            children: [
                                show.city || "Ort offen",
                                " · ",
                                show.program || "Programm offen",
                                show.markus_included && " · 🎹 Markus"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 295,
                            columnNumber: 1
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MissingSummary, {
                            missing: missing
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 300,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 288,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: `rounded-full px-3 py-1 text-xs font-black ${status.className}`,
                            children: status.label
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 304,
                            columnNumber: 11
                        }, this),
                        show.billing_status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-2 text-xs font-bold text-zinc-500",
                            children: [
                                "Abrechnung: ",
                                billingLabel(show.billing_status)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 309,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 303,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "relative z-10 flex flex-wrap justify-start gap-2 md:justify-end",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionLink, {
                            href: `/admin/shows/${show.id}`,
                            label: "Akte öffnen",
                            children: "✏️"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 316,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            action: duplicateShowAction,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "hidden",
                                    name: "show_id",
                                    value: show.id
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 321,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                                    label: "Show duplizieren",
                                    tone: "purple",
                                    children: "⧉"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 322,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 320,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            action: deleteShowAction,
                            onSubmit: (event)=>{
                                const ok = window.confirm(`Bist du sicher, dass du die Show "${show.venue || "ohne Location"}" löschen möchtest?`);
                                if (!ok) event.preventDefault();
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "hidden",
                                    name: "show_id",
                                    value: show.id
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 339,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ActionButton, {
                                    label: "Show löschen",
                                    tone: "red",
                                    children: "🗑️"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 340,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 327,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 315,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
            lineNumber: 275,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 274,
        columnNumber: 5
    }, this);
}
function MissingSummary({ missing }) {
    if (missing.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-3",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700",
                children: "Formular vollständig"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                lineNumber: 354,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
            lineNumber: 353,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-3 flex flex-wrap gap-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-600 shadow-sm",
                children: [
                    missing.length,
                    " Info",
                    missing.length === 1 ? "" : "s",
                    " fehlen"
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                lineNumber: 363,
                columnNumber: 7
            }, this),
            missing.slice(0, 2).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-500",
                    children: item
                }, item, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 368,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 362,
        columnNumber: 5
    }, this);
}
function ActionLink({ href, label, children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
        href: href,
        title: label,
        "aria-label": label,
        className: "flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white shadow-lg shadow-black/10 transition hover:scale-105",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 389,
        columnNumber: 5
    }, this);
}
function ActionButton({ label, tone, children }) {
    const className = tone === "purple" ? "bg-purple-100 text-purple-700" : "bg-red-100 text-red-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "submit",
        title: label,
        "aria-label": label,
        className: [
            "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition hover:scale-105",
            className
        ].join(" "),
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 415,
        columnNumber: 5
    }, this);
}
const FILTERS = [
    {
        key: "alle",
        label: "Alle"
    },
    {
        key: "aktiv",
        label: "Aktiv"
    },
    {
        key: "kommend",
        label: "Kommend"
    },
    {
        key: "entwurf",
        label: "Entwürfe"
    },
    {
        key: "vergangen_offen",
        label: "Vergangen offen"
    },
    {
        key: "abrechnung",
        label: "Abrechnung offen"
    },
    {
        key: "markus",
        label: "Markus dabei"
    },
    {
        key: "fertig",
        label: "Fertig"
    },
    {
        key: "arbeit",
        label: "In Arbeit"
    },
    {
        key: "archiv",
        label: "Archiv"
    }
];
function getMissingFields(show) {
    const missing = [];
    if (!show.show_date) missing.push("Datum");
    if (!show.venue) missing.push("Location");
    if (!show.city) missing.push("Stadt");
    if (!show.start_time) missing.push("Beginn");
    if (!show.contact_name) missing.push("Kontakt");
    if (!show.contact_email) missing.push("E-Mail");
    if (!show.venue_address) missing.push("Adresse");
    if (!show.technik) missing.push("Technik");
    return missing;
}
function getStatus(show) {
    const date = show.show_date ? new Date(show.show_date) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPast = date ? date < today : false;
    // ✅ Abgeschlossen (nur manuell)
    if (show.internal_status === "abgeschlossen") {
        return {
            key: "archiv",
            label: "✅ Abgeschlossen",
            className: "bg-emerald-100 text-emerald-700"
        };
    }
    // 📦 Archiv
    if (show.internal_status === "archiv" || show.internal_status === "archiviert") {
        return {
            key: "archiv",
            label: "📦 Archiv",
            className: "bg-zinc-200 text-zinc-700"
        };
    }
    // 💸 Abrechnung (nur nach Show!)
    if (isPast && show.billing_status !== "bezahlt") {
        return {
            key: "arbeit",
            label: "💸 Abrechnung offen",
            className: "bg-orange-100 text-orange-700"
        };
    }
    // 🔗 Vertrag
    const contractDone = (()=>{
        const value = String(show.contract_status || "").toLowerCase();
        return value.includes("liegt vor") || value.includes("unterschrieben");
    })();
    // 📋 Formular (aus checklist → gleiche Logik wie Akte!)
    const formComplete = show.checklist?.["Formular vollständig"] === true;
    // 🟡 Bereit (NEU statt "Fertig")
    if (formComplete && contractDone) {
        return {
            key: "bereit",
            label: "🟡 Bereit",
            className: "bg-amber-100 text-amber-700"
        };
    }
    // 🟠 In Arbeit
    if (formComplete || contractDone) {
        return {
            key: "arbeit",
            label: "🟠 In Arbeit",
            className: "bg-orange-100 text-orange-700"
        };
    }
    // 🔴 Offen
    return {
        key: "offen",
        label: "🔴 Offen",
        className: "bg-red-100 text-red-700"
    };
}
function billingLabel(value) {
    const labels = {
        offen: "offen",
        rechnung_geschrieben: "geschrieben",
        rechnung_verschickt: "verschickt",
        bezahlt: "bezahlt"
    };
    return labels[value || ""] || value || "offen";
}
function groupByMonth(shows) {
    return shows.reduce((acc, show)=>{
        const label = monthLabel(show.show_date);
        acc[label] ||= [];
        acc[label].push(show);
        return acc;
    }, {});
}
function monthLabel(date) {
    if (!date) return "Ohne Datum";
    const parsed = parseDate(date);
    if (!parsed) return "Ohne Datum";
    return parsed.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric"
    });
}
function Input({ name, label, type = "text", placeholder, defaultValue }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "grid gap-2 text-xs font-black text-zinc-700",
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: name,
                type: type,
                placeholder: placeholder,
                defaultValue: defaultValue,
                className: "h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                lineNumber: 581,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 579,
        columnNumber: 5
    }, this);
}
function formatDate(date) {
    if (!date) return "Datum offen";
    const parsed = parseDate(date);
    if (!parsed) return date;
    return parsed.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
function parseDate(date) {
    if (!date) return null;
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
function startOfToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
function isPastDate(date) {
    const parsed = parseDate(date);
    if (!parsed) return false;
    return parsed < startOfToday();
}
}),
];

//# sourceMappingURL=primakavi-show-portal_app_admin_AdminClient_tsx_0ysr-0b._.js.map