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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const years = Array.from(new Set(shows.map((s)=>s.show_date?.slice(0, 4)).filter(Boolean))).sort();
    const rows = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return shows.filter((show)=>{
            const status = getStatus(show);
            const date = show.show_date ? new Date(show.show_date) : null;
            const isPast = date ? date < today : false;
            const isFuture = date ? date >= today : true;
            const isArchived = show.internal_status === "abgeschlossen" || show.internal_status === "archiv";
            const text = [
                show.artist,
                show.program,
                show.venue,
                show.city,
                show.token,
                show.contact_name,
                show.contact_email
            ].join(" ").toLowerCase();
            const matchesSearch = text.includes(query.toLowerCase());
            const matchesYear = year === "alle" || show.show_date?.startsWith(year);
            const matchesFilter = filter === "alle" || filter === "aktiv" && !isArchived || filter === "kommend" && isFuture && !isArchived || filter === "entwurf" && !show.show_date || filter === "vergangen_offen" && isPast && !isArchived || filter === "abrechnung" && isPast && show.billing_status !== "bezahlt" || filter === "markus" && show.markus_included === true || filter === "archiv" && isArchived || status.key === filter;
            return matchesSearch && matchesYear && matchesFilter;
        });
    }, [
        shows,
        query,
        filter,
        year
    ]);
    const grouped = groupByMonth(rows);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-[#fbf7ef] px-8 py-8 text-zinc-950",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mx-auto max-w-6xl space-y-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                    className: "relative overflow-hidden rounded-[2rem] bg-[#101014] p-10 text-white shadow-2xl",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-10 top-8 text-6xl text-pink-400",
                            children: "♕"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 112,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-8 right-24 text-5xl text-orange-300",
                            children: "★"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 115,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute right-0 top-0 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 118,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-orange-400/20 blur-3xl"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 119,
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
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "mt-4 text-5xl font-black tracking-tight",
                                            children: "Alle Shows"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 126,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "mt-4 text-white/70",
                                            children: "Shows verwalten, Akten öffnen und Portale verschicken."
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 129,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 122,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setShowCreate((prev)=>!prev),
                                    className: "rounded-3xl bg-gradient-to-r from-pink-400 to-orange-400 px-6 py-4 font-black text-white shadow-xl transition hover:scale-[1.02]",
                                    children: "Neue Show +"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 111,
                    columnNumber: 9
                }, this),
                showCreate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-6 shadow-xl shadow-black/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-black",
                            children: "Neue Show anlegen"
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 146,
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
                                    lineNumber: 152,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "program",
                                    label: "Programm",
                                    placeholder: "Jetzt mal Tacheles"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 157,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "show_date",
                                    label: "Datum",
                                    type: "date"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 162,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "venue",
                                    label: "Location",
                                    placeholder: "Brakula"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 163,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "city",
                                    label: "Stadt",
                                    placeholder: "Hamburg"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 164,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "entry_time",
                                    label: "Einlass",
                                    placeholder: "19:00 Uhr"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                    name: "start_time",
                                    label: "Showbeginn",
                                    placeholder: "20:00 Uhr"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 170,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "self-end rounded-2xl bg-zinc-950 px-5 py-4 font-black text-white shadow-lg",
                                    children: "Erstellen →"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 176,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 148,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 145,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-4 lg:grid-cols-[1fr_auto]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: query,
                                    onChange: (e)=>setQuery(e.target.value),
                                    placeholder: "Suche nach Location, Stadt, Programm, Kontakt...",
                                    className: "h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 188,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    value: year,
                                    onChange: (e)=>setYear(e.target.value),
                                    className: "h-14 rounded-2xl border border-zinc-200 bg-[#fbf7ef] px-5 text-sm font-black outline-none",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: "alle",
                                            children: "Alle Jahre"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                            lineNumber: 200,
                                            columnNumber: 15
                                        }, this),
                                        years.map((y)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: y,
                                                children: y
                                            }, y, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                lineNumber: 202,
                                                columnNumber: 17
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 195,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 187,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-4 flex flex-wrap gap-2",
                            children: [
                                [
                                    "alle",
                                    "Alle"
                                ],
                                [
                                    "aktiv",
                                    "Aktiv"
                                ],
                                [
                                    "kommend",
                                    "Kommend"
                                ],
                                [
                                    "entwurf",
                                    "Entwürfe"
                                ],
                                [
                                    "vergangen_offen",
                                    "Vergangen offen"
                                ],
                                [
                                    "abrechnung",
                                    "Abrechnung offen"
                                ],
                                [
                                    "markus",
                                    "Markus dabei"
                                ],
                                [
                                    "fertig",
                                    "Fertig"
                                ],
                                [
                                    "arbeit",
                                    "In Arbeit"
                                ],
                                [
                                    "archiv",
                                    "Archiv"
                                ]
                            ].map(([key, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setFilter(key),
                                    className: `rounded-full px-4 py-2 text-sm font-black transition ${filter === key ? "bg-zinc-950 text-white" : "bg-[#fbf7ef] text-zinc-700 hover:bg-[#f5ead9]"}`,
                                    children: label
                                }, key, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                    lineNumber: 222,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 209,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 186,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                    className: "rounded-[2rem] bg-white p-5 shadow-xl shadow-black/5",
                    children: [
                        Object.entries(grouped).map(([month, monthShows])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mb-8 last:mb-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "mb-4 text-2xl font-black",
                                        children: month
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                        lineNumber: 241,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3",
                                        children: monthShows.map((show)=>{
                                            const status = getStatus(show);
                                            const missing = getMissingFields(show);
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative rounded-3xl bg-[#fbf7ef] p-5 transition hover:-translate-y-0.5 hover:bg-[#f5ead9]",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "grid gap-4 md:grid-cols-[140px_1fr_170px_250px] md:items-center",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-lg font-black",
                                                                    children: formatDate(show.show_date)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 255,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-bold text-zinc-500",
                                                                    children: show.start_time || "Uhrzeit offen"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 258,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                            lineNumber: 254,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xl font-black",
                                                                    children: show.venue || "Location offen"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 264,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm font-semibold text-zinc-500",
                                                                    children: [
                                                                        show.city || "Ort offen",
                                                                        " ·",
                                                                        " ",
                                                                        show.program || "Programm offen"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 267,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "mt-3 flex flex-wrap gap-2",
                                                                    children: [
                                                                        show.markus_included && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700",
                                                                            children: "🎹 Markus dabei"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                            lineNumber: 274,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        missing.slice(0, 3).map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-600 shadow-sm",
                                                                                children: [
                                                                                    "fehlt: ",
                                                                                    item
                                                                                ]
                                                                            }, item, true, {
                                                                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                                lineNumber: 280,
                                                                                columnNumber: 31
                                                                            }, this)),
                                                                        missing.length > 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "rounded-full bg-white px-3 py-1 text-xs font-black text-zinc-600 shadow-sm",
                                                                            children: [
                                                                                "+",
                                                                                missing.length - 3
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                            lineNumber: 289,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 272,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                            lineNumber: 263,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: `rounded-full px-3 py-1 text-xs font-black ${status.className}`,
                                                                    children: status.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 297,
                                                                    columnNumber: 27
                                                                }, this),
                                                                show.billing_status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "mt-2 text-xs font-bold text-zinc-500",
                                                                    children: [
                                                                        "Abrechnung: ",
                                                                        billingLabel(show.billing_status)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 304,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                            lineNumber: 296,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "relative z-10 flex flex-wrap justify-start gap-2 md:justify-end",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                                                                    href: `/admin/shows/${show.id}`,
                                                                    title: "Akte bearbeiten",
                                                                    className: "flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-sm font-black text-white transition hover:scale-105",
                                                                    children: "✏️"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 311,
                                                                    columnNumber: 27
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
                                                                            lineNumber: 320,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "submit",
                                                                            title: "Show duplizieren",
                                                                            className: "flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-black text-purple-700 transition hover:scale-105",
                                                                            children: "⧉"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                            lineNumber: 325,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 319,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                                                    action: deleteShowAction,
                                                                    onSubmit: (e)=>{
                                                                        const ok = window.confirm(`Bist du sicher, dass du die Show "${show.venue || "ohne Location"}" löschen möchtest?`);
                                                                        if (!ok) e.preventDefault();
                                                                    },
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "hidden",
                                                                            name: "show_id",
                                                                            value: show.id
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                            lineNumber: 345,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "submit",
                                                                            title: "Show löschen",
                                                                            className: "flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-black text-red-700 transition hover:scale-105",
                                                                            children: "🗑️"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                            lineNumber: 350,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                                    lineNumber: 334,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 23
                                                }, this)
                                            }, show.id, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                                lineNumber: 249,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                        lineNumber: 243,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, month, true, {
                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                lineNumber: 240,
                                columnNumber: 13
                            }, this)),
                        rows.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-3xl bg-[#fbf7ef] p-10 text-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-black",
                                children: "Keine Shows gefunden."
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                                lineNumber: 369,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                            lineNumber: 368,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
                    lineNumber: 238,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
            lineNumber: 110,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 109,
        columnNumber: 5
    }, this);
}
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
    if (show.internal_status === "abgeschlossen") {
        return {
            key: "archiv",
            label: "✅ Abgeschlossen",
            className: "bg-emerald-100 text-emerald-700"
        };
    }
    if (show.internal_status === "archiv") {
        return {
            key: "archiv",
            label: "📦 Archiv",
            className: "bg-zinc-200 text-zinc-700"
        };
    }
    if (isPast && show.billing_status !== "bezahlt") {
        return {
            key: "arbeit",
            label: "💸 Abrechnung offen",
            className: "bg-orange-100 text-orange-700"
        };
    }
    const checks = [
        !!show.show_date,
        !!show.contact_name && !!show.contact_email,
        !!show.start_time,
        !!show.technik,
        !!show.venue_address,
        !!show.show_files?.length
    ];
    const done = checks.filter(Boolean).length;
    if (done === checks.length) {
        return {
            key: "fertig",
            label: "🟢 Fertig",
            className: "bg-emerald-100 text-emerald-700"
        };
    }
    if (done >= checks.length - 2) {
        return {
            key: "fast",
            label: "🟡 Fast fertig",
            className: "bg-amber-100 text-amber-700"
        };
    }
    if (done >= 2) {
        return {
            key: "arbeit",
            label: "🟠 In Arbeit",
            className: "bg-orange-100 text-orange-700"
        };
    }
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
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "Ohne Datum";
    return d.toLocaleDateString("de-DE", {
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
                lineNumber: 513,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/AdminClient.tsx",
        lineNumber: 511,
        columnNumber: 5
    }, this);
}
function formatDate(date) {
    if (!date) return "Datum offen";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return date;
    return d.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
}
}),
"[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=primakavi-show-portal_033qzsc._.js.map