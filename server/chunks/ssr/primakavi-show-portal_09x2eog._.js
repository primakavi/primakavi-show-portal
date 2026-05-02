module.exports = [
"[project]/primakavi-show-portal/app/admin/shows/[id]/CopyMailButtons.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CopyMailButtons
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
"use client";
;
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
function CopyMailButtons({ show, portalUrl }) {
    const subject = `Veranstalterinfos Sonja Gründemann – ${formatDate(show.show_date)} ${show.venue || ""}`;
    const text = `Hallo${show.contact_name ? ` ${show.contact_name}` : ""},

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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: async ()=>{
                    await navigator.clipboard.writeText(subject);
                    alert("Betreff kopiert ✓");
                },
                className: "rounded-2xl bg-white px-5 py-3 text-center text-sm font-black text-zinc-950",
                children: "Betreff kopieren"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/CopyMailButtons.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: async ()=>{
                    await navigator.clipboard.writeText(text);
                    alert("Mailtext kopiert ✓");
                },
                className: "rounded-2xl bg-gradient-to-r from-pink-400 to-orange-400 px-5 py-3 text-center text-sm font-black text-white",
                children: "📋 Mailtext kopieren"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/[id]/CopyMailButtons.tsx",
                lineNumber: 58,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true);
}
}),
"[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime;
}),
];

//# sourceMappingURL=primakavi-show-portal_09x2eog._.js.map