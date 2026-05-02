module.exports = [
"[project]/primakavi-show-portal/app/lib/supabaseAdmin.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabaseAdmin",
    ()=>supabaseAdmin
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
;
const supabaseAdmin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(("TURBOPACK compile-time value", "https://wvhidzyzukbrkpuicckf.supabase.co"), process.env.SUPABASE_SERVICE_ROLE_KEY);
}),
"[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "default",
    ()=>ShowAktePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"404b113459dcaa8d32014e56bdac80fc175f5b5024":{"name":"$$RSC_SERVER_ACTION_0"}},"primakavi-show-portal/app/admin/shows/[id]/page.tsx",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/supabaseAdmin.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function ShowAktePage({ params }) {
    const { id } = await params;
    const { data: show, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").select("*").eq("id", id).single();
    if (error || !show) (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const headerList = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const host = headerList.get("host");
    const protocol = host?.includes("localhost") ? "http" : "https";
    const portalUrl = host ? `${protocol}://${host}/show/${show.token}` : `/show/${show.token}`;
    const progress = getProgress(show);
    const status = getStatus(show);
    const nextStep = getNextStep(show);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-[#fbf7ef] px-8 py-8 pb-32 text-zinc-950",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
            action: updateShowAction,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "hidden",
                    name: "id",
                    value: show.id
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mx-auto max-w-7xl space-y-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "relative overflow-hidden rounded-[2rem] bg-zinc-950 px-10 py-12 text-white shadow-2xl",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(221,242,26,0.16),transparent_24%),radial-gradient(circle_at_24%_34%,rgba(168,85,247,0.24),transparent_30%),radial-gradient(circle_at_76%_62%,rgba(236,72,153,0.32),transparent_34%)]"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 40,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute right-12 top-8 text-7xl text-pink-400/80",
                                    children: "♕"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 41,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "absolute bottom-8 right-28 text-5xl text-orange-300/90",
                                    children: "★"
                                }, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 42,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-black uppercase tracking-[0.22em] text-zinc-300",
                                                    children: "Show-Akte"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 46,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                    className: "mt-5 max-w-3xl text-5xl font-black leading-tight tracking-tight",
                                                    children: show.venue || "Neue Show"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 50,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "mt-4 text-lg font-semibold text-zinc-300",
                                                    children: [
                                                        formatDate(show.show_date),
                                                        " · ",
                                                        show.city || "Ort offen",
                                                        " ·",
                                                        " ",
                                                        show.program || "Programm offen"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 54,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-5 flex flex-wrap gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `rounded-full px-4 py-2 text-sm font-black ${status.className}`,
                                                            children: status.label
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 60,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white",
                                                            children: [
                                                                "Nächster Schritt: ",
                                                                nextStep
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 64,
                                                            columnNumber: 19
                                                        }, this),
                                                        show.markus_included && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-purple-400/20 px-4 py-2 text-sm font-black text-purple-100 ring-1 ring-purple-300/30",
                                                            children: "🎹 Markus dabei"
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 69,
                                                            columnNumber: 21
                                                        }, this),
                                                        show.billing_status && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white",
                                                            children: [
                                                                "Abrechnung: ",
                                                                billingLabel(show.billing_status)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 75,
                                                            columnNumber: 21
                                                        }, this),
                                                        show.follow_up_date && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded-full bg-white/10 px-4 py-2 text-sm font-black text-white",
                                                            children: [
                                                                "WVL: ",
                                                                formatDate(show.follow_up_date)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 80,
                                                            columnNumber: 3
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 59,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 45,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-3",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `/show/${show.token}`,
                                                target: "_blank",
                                                className: "rounded-2xl bg-white/10 px-5 py-3 text-sm font-black text-white hover:bg-white/20",
                                                children: "Formular öffnen →"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 89,
                                                columnNumber: 3
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 88,
                                            columnNumber: 1
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 44,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                            lineNumber: 39,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid gap-8 lg:grid-cols-[1fr_360px]",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                    className: "space-y-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "01",
                                            title: "Veranstaltung",
                                            doodle: "〰",
                                            tone: "purple",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "artist",
                                                        label: "Artist",
                                                        defaultValue: show.artist
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 104,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "program",
                                                        label: "Programm",
                                                        defaultValue: show.program
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 105,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "show_date",
                                                        label: "Datum",
                                                        type: "date",
                                                        defaultValue: show.show_date
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 106,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "venue",
                                                        label: "Location",
                                                        defaultValue: show.venue
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 107,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "city",
                                                        label: "Stadt",
                                                        defaultValue: show.city
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 108,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "entry_time",
                                                        label: "Einlass",
                                                        defaultValue: show.entry_time
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 109,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "start_time",
                                                        label: "Beginn",
                                                        defaultValue: show.start_time
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 110,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 103,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 102,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "02",
                                            title: "Kontakt vor Ort",
                                            doodle: "☆",
                                            tone: "pink",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "contact_name",
                                                        label: "Ansprechpartner:in",
                                                        defaultValue: show.contact_name
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 116,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "contact_email",
                                                        label: "E-Mail",
                                                        defaultValue: show.contact_email
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 117,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "contact_phone",
                                                        label: "Telefon",
                                                        defaultValue: show.contact_phone
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 118,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "venue_address",
                                                        label: "Adresse",
                                                        defaultValue: show.venue_address
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 119,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 115,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 114,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "03",
                                            title: "Ablauf",
                                            doodle: "↙",
                                            tone: "orange",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                name: "schedule",
                                                label: "Ablauf / Timing",
                                                defaultValue: show.schedule
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 124,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 123,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "04",
                                            title: "Technik",
                                            doodle: "♫",
                                            tone: "purple",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                name: "technik",
                                                label: "Technik",
                                                defaultValue: show.technik
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 128,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 127,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "05",
                                            title: "Vertrag & Finanzen",
                                            doodle: "♡",
                                            tone: "orange",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                    name: "finance_summary",
                                                    label: "Vertrag, Honorar, Tickets & Rechnung",
                                                    defaultValue: financeSummary(show)
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "contract_status",
                                                    defaultValue: show.contract_status || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "fee",
                                                    defaultValue: show.fee || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 139,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "ticket_prices",
                                                    defaultValue: show.ticket_prices || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 140,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "capacity",
                                                    defaultValue: show.capacity || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 141,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "free_tickets",
                                                    defaultValue: show.free_tickets || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 142,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "ticket_link",
                                                    defaultValue: show.ticket_link || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 143,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "invoice_email",
                                                    defaultValue: show.invoice_email || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 144,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "invoice_address",
                                                    defaultValue: show.invoice_address || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 145,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "contract_notes",
                                                    defaultValue: show.contract_notes || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 146,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 131,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "06",
                                            title: "Promotion",
                                            doodle: "✦",
                                            tone: "pink",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                name: "promotion",
                                                label: "Promotion / Material / Hinweise",
                                                defaultValue: show.promotion
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 150,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 149,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "07",
                                            title: "Anreise, Hotel & Backstage",
                                            doodle: "↗",
                                            tone: "teal",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                    name: "travel_summary",
                                                    label: "Anreise, Unterkunft, Catering & Backstage",
                                                    defaultValue: travelSummary(show)
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 154,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "anreise",
                                                    defaultValue: show.anreise || show.travel_details || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 160,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "unterkunft",
                                                    defaultValue: show.unterkunft || show.accommodation_notes || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 161,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "catering_details",
                                                    defaultValue: show.catering_details || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 162,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "hidden",
                                                    name: "backstage_equipment",
                                                    defaultValue: show.backstage_equipment || ""
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 163,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 153,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                            number: "08",
                                            title: "Notizen",
                                            doodle: "?",
                                            tone: "zinc",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                name: "general_notes",
                                                label: "Interne / allgemeine Notizen",
                                                defaultValue: show.general_notes
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 167,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 166,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 101,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                    className: "space-y-6 lg:sticky lg:top-8 lg:self-start",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                            title: "Interne Steuerung",
                                            tone: "zinc",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        name: "internal_status",
                                                        label: "Status intern",
                                                        defaultValue: show.internal_status,
                                                        options: [
                                                            [
                                                                "offen",
                                                                "Offen"
                                                            ],
                                                            [
                                                                "in_arbeit",
                                                                "In Arbeit"
                                                            ],
                                                            [
                                                                "wartet_auf_veranstalter",
                                                                "Wartet auf Veranstalter"
                                                            ],
                                                            [
                                                                "fertig",
                                                                "Fertig"
                                                            ],
                                                            [
                                                                "abgeschlossen",
                                                                "Abgeschlossen"
                                                            ],
                                                            [
                                                                "archiv",
                                                                "Archiv"
                                                            ]
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 174,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        name: "billing_status",
                                                        label: "Abrechnung",
                                                        defaultValue: show.billing_status,
                                                        options: [
                                                            [
                                                                "offen",
                                                                "Offen"
                                                            ],
                                                            [
                                                                "rechnung_zu_schreiben",
                                                                "Rechnung zu schreiben"
                                                            ],
                                                            [
                                                                "rechnung_verschickt",
                                                                "Rechnung verschickt"
                                                            ],
                                                            [
                                                                "bezahlt",
                                                                "Bezahlt"
                                                            ],
                                                            [
                                                                "nicht_relevant",
                                                                "Nicht relevant"
                                                            ]
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 188,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "next_step",
                                                        label: "Nächster Schritt manuell",
                                                        defaultValue: show.next_step
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        name: "follow_up_date",
                                                        label: "Wiedervorlage",
                                                        type: "date",
                                                        defaultValue: show.follow_up_date
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 202,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-zinc-700",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "checkbox",
                                                                name: "markus_included",
                                                                defaultChecked: !!show.markus_included,
                                                                className: "h-5 w-5"
                                                            }, void 0, false, {
                                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                                lineNumber: 205,
                                                                columnNumber: 21
                                                            }, this),
                                                            "🎹 Markus dabei"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 204,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 17
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 172,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                            title: "Akte Status",
                                            tone: "purple",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-black text-purple-700",
                                                            children: [
                                                                progress.done,
                                                                " / ",
                                                                progress.total,
                                                                " erledigt"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 218,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: `rounded-full px-3 py-1 text-xs font-black ${status.className}`,
                                                            children: status.short
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 221,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 217,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-4 h-2 rounded-full bg-purple-200",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-2 rounded-full bg-purple-500 transition-all",
                                                        style: {
                                                            width: `${progress.percent}%`
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 227,
                                                        columnNumber: 19
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 226,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "mt-5 space-y-2",
                                                    children: progress.missing.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-black text-emerald-700",
                                                        children: "Alles vollständig 🎉"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                        lineNumber: 235,
                                                        columnNumber: 21
                                                    }, this) : progress.missing.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "rounded-2xl bg-white/80 px-4 py-3 text-sm font-bold text-zinc-700",
                                                            children: [
                                                                "fehlt: ",
                                                                item
                                                            ]
                                                        }, item, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                            lineNumber: 240,
                                                            columnNumber: 23
                                                        }, this))
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 216,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                            title: "Portal-Link",
                                            tone: "teal",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "break-all rounded-2xl bg-white/80 p-4 text-sm font-bold text-zinc-700",
                                                    children: portalUrl
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 252,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: makeMailto(show, portalUrl),
                                                    className: "mt-4 block rounded-2xl bg-zinc-950 px-5 py-3 text-center text-sm font-black text-white",
                                                    children: "Mail mit Portal-Link vorbereiten"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                                    lineNumber: 256,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                            lineNumber: 251,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                    lineNumber: 171,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                            lineNumber: 100,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed bottom-5 left-[calc(18rem+2rem)] right-8 z-30 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mx-auto flex max-w-7xl items-center justify-between gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "font-black",
                                        children: "Akte speichern"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                        lineNumber: 270,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-zinc-400",
                                        children: "Änderungen werden erst nach dem Speichern übernommen."
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                        lineNumber: 271,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                lineNumber: 269,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "submit",
                                className: "rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-9 py-4 font-black text-white shadow-lg transition hover:scale-[1.02]",
                                children: "Akte speichern →"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                lineNumber: 276,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                        lineNumber: 268,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                    lineNumber: 267,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
            lineNumber: 35,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
const $$RSC_SERVER_ACTION_0 = async function updateShowAction(formData) {
    const id = String(formData.get("id") || "");
    const showDate = value(formData, "show_date");
    const parsedFinance = parseFinanceSummary(value(formData, "finance_summary"));
    const parsedTravel = parseTravelSummary(value(formData, "travel_summary"));
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").update({
        artist: value(formData, "artist"),
        program: value(formData, "program"),
        show_date: showDate,
        weekday: getWeekday(showDate),
        venue: value(formData, "venue"),
        city: value(formData, "city"),
        entry_time: value(formData, "entry_time"),
        start_time: value(formData, "start_time"),
        contact_name: value(formData, "contact_name"),
        contact_email: value(formData, "contact_email"),
        contact_phone: value(formData, "contact_phone"),
        venue_address: value(formData, "venue_address"),
        schedule: value(formData, "schedule"),
        technik: value(formData, "technik"),
        contract_status: parsedFinance.contract_status || value(formData, "contract_status"),
        fee: parsedFinance.fee || value(formData, "fee"),
        ticket_link: parsedFinance.ticket_link || value(formData, "ticket_link"),
        ticket_prices: parsedFinance.ticket_prices || value(formData, "ticket_prices"),
        capacity: parsedFinance.capacity || value(formData, "capacity"),
        free_tickets: parsedFinance.free_tickets || value(formData, "free_tickets"),
        invoice_email: parsedFinance.invoice_email || value(formData, "invoice_email"),
        invoice_address: parsedFinance.invoice_address || value(formData, "invoice_address"),
        contract_notes: parsedFinance.contract_notes || value(formData, "contract_notes"),
        billing_status: value(formData, "billing_status"),
        promotion: value(formData, "promotion"),
        anreise: parsedTravel.anreise || value(formData, "anreise"),
        unterkunft: parsedTravel.unterkunft || value(formData, "unterkunft"),
        catering_details: parsedTravel.catering_details || value(formData, "catering_details"),
        backstage_equipment: parsedTravel.backstage_equipment || value(formData, "backstage_equipment"),
        general_notes: value(formData, "general_notes"),
        internal_status: value(formData, "internal_status"),
        next_step: value(formData, "next_step"),
        follow_up_date: value(formData, "follow_up_date"),
        markus_included: formData.get("markus_included") === "on"
    }).eq("id", id);
    if (error) throw new Error(error.message);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/admin/shows/${id}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/admin");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/admin/shows");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/markus");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "404b113459dcaa8d32014e56bdac80fc175f5b5024", null);
var updateShowAction = $$RSC_SERVER_ACTION_0;
function financeSummary(show) {
    return [
        show.contract_status && `Vertrag: ${show.contract_status}`,
        show.fee && `Honorar: ${show.fee}`,
        show.ticket_prices && `Eintrittspreise: ${show.ticket_prices}`,
        show.capacity && `Kapazität: ${show.capacity}`,
        show.free_tickets && `Freikarten: ${show.free_tickets}`,
        show.ticket_link && `Ticketlink: ${show.ticket_link}`,
        show.invoice_email && `Rechnungs-E-Mail: ${show.invoice_email}`,
        show.billing_status && `Abrechnung: ${billingLabel(show.billing_status)}`,
        show.invoice_address && `Rechnungsadresse: ${show.invoice_address}`,
        show.contract_notes && `Hinweise: ${show.contract_notes}`
    ].filter(Boolean).join("\n");
}
function travelSummary(show) {
    return [
        (show.anreise || show.travel_details) && `Anreise: ${show.anreise || show.travel_details}`,
        (show.unterkunft || show.accommodation_notes) && `Unterkunft: ${show.unterkunft || show.accommodation_notes}`,
        show.catering_details && `Catering: ${show.catering_details}`,
        show.backstage_equipment && `Backstage: ${show.backstage_equipment}`
    ].filter(Boolean).join("\n");
}
function parseFinanceSummary(text) {
    return parseSummary(text, {
        vertrag: "contract_status",
        honorar: "fee",
        eintrittspreise: "ticket_prices",
        preise: "ticket_prices",
        kapazität: "capacity",
        kapazitaet: "capacity",
        plätze: "capacity",
        plaetze: "capacity",
        freikarten: "free_tickets",
        ticketlink: "ticket_link",
        "rechnungs-e-mail": "invoice_email",
        rechnungsmail: "invoice_email",
        rechnungsadresse: "invoice_address",
        hinweise: "contract_notes"
    });
}
function parseTravelSummary(text) {
    return parseSummary(text, {
        anreise: "anreise",
        unterkunft: "unterkunft",
        hotel: "unterkunft",
        catering: "catering_details",
        backstage: "backstage_equipment"
    });
}
function parseSummary(text, map) {
    const result = {};
    if (!text) return result;
    for (const line of text.split("\n")){
        const [rawKey, ...rest] = line.split(":");
        const rawValue = rest.join(":").trim();
        if (!rawKey || !rawValue) continue;
        const key = rawKey.trim().toLowerCase();
        const mapped = map[key];
        if (mapped) result[mapped] = rawValue;
    }
    return result;
}
function getProgress(show) {
    const fields = [
        [
            "Datum",
            show.show_date
        ],
        [
            "Location",
            show.venue
        ],
        [
            "Stadt",
            show.city
        ],
        [
            "Beginn",
            show.start_time
        ],
        [
            "Kontakt",
            show.contact_name
        ],
        [
            "E-Mail",
            show.contact_email
        ],
        [
            "Adresse",
            show.venue_address
        ],
        [
            "Technik",
            show.technik
        ],
        [
            "Honorar",
            show.fee
        ],
        [
            "Vertragsstatus",
            show.contract_status
        ],
        [
            "Eintrittspreise",
            show.ticket_prices
        ],
        [
            "Kapazität",
            show.capacity
        ],
        [
            "Anreise",
            show.anreise || show.travel_details
        ],
        [
            "Unterkunft",
            show.unterkunft || show.accommodation_notes
        ]
    ];
    const done = fields.filter(([, fieldValue])=>!!fieldValue).length;
    const total = fields.length;
    return {
        done,
        total,
        percent: Math.round(done / total * 100),
        missing: fields.filter(([, fieldValue])=>!fieldValue).map(([label])=>label)
    };
}
function getStatus(show) {
    if (show.internal_status === "abgeschlossen") {
        return {
            label: "✅ Abgeschlossen",
            short: "abgeschlossen",
            className: "bg-emerald-100 text-emerald-700"
        };
    }
    if (show.internal_status === "archiv") {
        return {
            label: "📦 Archiv",
            short: "Archiv",
            className: "bg-zinc-200 text-zinc-700"
        };
    }
    const progress = getProgress(show);
    if (progress.done === progress.total) {
        return {
            label: "🟢 Fertig",
            short: "fertig",
            className: "bg-emerald-100 text-emerald-700"
        };
    }
    if (progress.done >= progress.total - 3) {
        return {
            label: "🟡 Fast fertig",
            short: "fast fertig",
            className: "bg-amber-100 text-amber-700"
        };
    }
    if (progress.done >= 3) {
        return {
            label: "🟠 In Arbeit",
            short: "in Arbeit",
            className: "bg-orange-100 text-orange-700"
        };
    }
    return {
        label: "🔴 Offen",
        short: "offen",
        className: "bg-red-100 text-red-700"
    };
}
function getNextStep(show) {
    if (show.next_step) return show.next_step;
    if (!show.show_date) return "Datum klären";
    if (!show.venue) return "Location ergänzen";
    if (!show.contact_email) return "Kontakt-E-Mail einholen";
    if (!show.technik) return "Technikdaten klären";
    if (!show.fee) return "Honorar / Abrechnung klären";
    if (!show.contract_status) return "Vertragsstatus prüfen";
    if (!show.ticket_prices) return "Eintrittspreise ergänzen";
    if (!show.capacity) return "Kapazität ergänzen";
    if (!show.anreise && !show.travel_details) return "Anreise klären";
    if (!show.unterkunft && !show.accommodation_notes) return "Unterkunft klären";
    return "Alles bereit 🎉";
}
function billingLabel(value) {
    const labels = {
        offen: "Offen",
        rechnung_zu_schreiben: "Rechnung zu schreiben",
        rechnung_verschickt: "Rechnung verschickt",
        bezahlt: "Bezahlt",
        nicht_relevant: "Nicht relevant"
    };
    return labels[value || ""] || value || "Offen";
}
function FormSection({ number, title, doodle, tone, children }) {
    const theme = getTheme(tone);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative rounded-[1.75rem] bg-white p-6 shadow-xl shadow-zinc-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `absolute right-7 top-7 rotate-[-8deg] text-3xl font-black opacity-50 ${theme.doodle}`,
                children: doodle
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 528,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex items-start gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.number} text-xl font-black text-zinc-900`,
                        children: number
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                        lineNumber: 533,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-black tracking-tight",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                lineNumber: 538,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm font-semibold text-zinc-500",
                                children: sectionDescription(title)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                                lineNumber: 539,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                        lineNumber: 537,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 532,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid gap-5 rounded-3xl border-2 border-dashed p-5 ${theme.shell}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 545,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 527,
        columnNumber: 5
    }, this);
}
function SideCard({ title, tone, children }) {
    const styles = {
        purple: "border-purple-200 bg-purple-50/70",
        amber: "border-amber-200 bg-amber-50/70",
        teal: "border-teal-200 bg-teal-50/70",
        zinc: "border-zinc-200 bg-zinc-50/70"
    }[tone];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "rounded-[1.75rem] bg-white p-5 shadow-xl shadow-zinc-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "mb-4 text-lg font-black",
                children: title
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 570,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-3xl border-2 border-dashed p-4 ${styles}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 571,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 569,
        columnNumber: 5
    }, this);
}
function CompactGrid({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 579,
        columnNumber: 10
    }, this);
}
function Input({ name, label, defaultValue, type = "text" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "grid gap-2 text-xs font-black text-zinc-700",
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: name,
                type: type,
                defaultValue: defaultValue || "",
                className: "h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 596,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 594,
        columnNumber: 5
    }, this);
}
function Select({ name, label, defaultValue, options }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "grid gap-2 text-xs font-black text-zinc-700",
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                name: name,
                defaultValue: defaultValue || "",
                className: "h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: "Bitte auswählen"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                        lineNumber: 625,
                        columnNumber: 9
                    }, this),
                    options.map(([value, label])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            value: value,
                            children: label
                        }, value, false, {
                            fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                            lineNumber: 627,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 620,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 618,
        columnNumber: 5
    }, this);
}
function Textarea({ name, label, defaultValue }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "grid gap-2 text-xs font-black text-zinc-700 md:col-span-2",
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                name: name,
                defaultValue: defaultValue || "",
                rows: 5,
                className: "rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold leading-7 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
                lineNumber: 648,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx",
        lineNumber: 646,
        columnNumber: 5
    }, this);
}
function getTheme(tone) {
    const themes = {
        purple: {
            shell: "border-purple-200 bg-purple-50/60",
            number: "from-purple-200 to-pink-300",
            doodle: "text-purple-400"
        },
        pink: {
            shell: "border-pink-200 bg-pink-50/60",
            number: "from-pink-200 to-rose-300",
            doodle: "text-pink-400"
        },
        orange: {
            shell: "border-orange-200 bg-orange-50/60",
            number: "from-amber-200 to-orange-300",
            doodle: "text-orange-400"
        },
        teal: {
            shell: "border-teal-200 bg-teal-50/60",
            number: "from-teal-200 to-emerald-300",
            doodle: "text-teal-500"
        },
        zinc: {
            shell: "border-zinc-200 bg-zinc-50/70",
            number: "from-zinc-200 to-zinc-300",
            doodle: "text-zinc-400"
        }
    };
    return themes[tone] || themes.zinc;
}
function sectionDescription(title) {
    const descriptions = {
        Veranstaltung: "Grunddaten zum Auftritt.",
        "Kontakt vor Ort": "Wer ist vor Ort erreichbar?",
        Ablauf: "Alles rund um Timing und Ablauf.",
        Technik: "Technische Anforderungen und Hinweise.",
        "Vertrag & Finanzen": "Honorar, Tickets, Vertrag, Rechnung und Kapazität.",
        Promotion: "Werbung, Ticketlink und Material.",
        "Anreise, Hotel & Backstage": "Anreise, Unterkunft, Catering und Backstage.",
        Notizen: "Interne und allgemeine Hinweise."
    };
    return descriptions[title] || "";
}
function value(formData, key) {
    const raw = formData.get(key);
    if (raw === null) return null;
    const stringValue = String(raw).trim();
    return stringValue === "" ? null : stringValue;
}
function getWeekday(date) {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("de-DE", {
        weekday: "long"
    }).toUpperCase();
}
function buildMailText(show, portalUrl) {
    const greeting = show.contact_name ? `Hallo ${show.contact_name},` : "Hallo,";
    return `${greeting}

hier ist der Link zum Veranstalter-Portal für den Auftritt von Sonja Gründemann:

${portalUrl}

Die bekannten Rahmendaten:
- Datum: ${formatDate(show.show_date)}
- Location: ${show.venue || "offen"}
- Stadt: ${show.city || "offen"}
- Programm: ${show.program || "offen"}
- Beginn: ${show.start_time || "offen"}

Bitte ergänzt dort die noch offenen Infos zu Ablauf, Technik, Anreise und Organisation.

Vielen Dank und herzliche Grüße
primakavi Booking`;
}
function makeMailto(show, portalUrl) {
    const to = show.contact_email || "";
    const subject = `Veranstalterinfos Sonja Gründemann – ${formatDate(show.show_date)} ${show.venue || ""}`;
    const greeting = show.contact_name ? `Hallo ${show.contact_name},` : "Hallo,";
    const body = `${greeting}

hier ist der Link zum Veranstalter-Portal für den Auftritt von Sonja Gründemann:

${portalUrl}

Bitte ergänzen Sie dort die noch offenen Informationen zu Ablauf, Technik, Anreise und Organisation.

Vielen Dank und herzliche Grüße
primakavi Booking`;
    return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
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
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)");
;
}),
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "404b113459dcaa8d32014e56bdac80fc175f5b5024",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/[id]/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=primakavi-show-portal_0g6j2lj._.js.map