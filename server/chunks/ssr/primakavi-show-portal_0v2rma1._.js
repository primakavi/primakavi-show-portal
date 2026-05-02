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
"[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "$$RSC_SERVER_ACTION_0",
    ()=>$$RSC_SERVER_ACTION_0,
    "$$RSC_SERVER_ACTION_1",
    ()=>$$RSC_SERVER_ACTION_1,
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
/* __next_internal_action_entry_do_not_use__ [{"402274442b32d392693ced387e9a15cafee8bb82f5":{"name":"$$RSC_SERVER_ACTION_0"},"40399aedbd592b32cca6cc84f2e7ee2cfb8cd7f91e":{"name":"$$RSC_SERVER_ACTION_1"}},"primakavi-show-portal/app/admin/shows/page.tsx",""] */ var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/supabaseAdmin.ts [app-rsc] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module './AdminClient'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
;
;
;
;
;
async function AdminPage() {
    const { data: shows, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").select(`
      id,
      token,
      artist,
      program,
      show_date,
      weekday,
      venue,
      city,
      start_time,
      entry_time,
      created_at,
      show_details (*),
      show_files (id, file_name, file_type, storage_path),
      show_admin_notes (*)
    `).order("show_date", {
        ascending: true
    });
    if (error) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen bg-[#fbf7ef] p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl bg-white p-8 font-bold text-red-600 shadow-xl",
                children: [
                    "Fehler: ",
                    error.message
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/admin/shows/page.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/primakavi-show-portal/app/admin/shows/page.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(AdminClient, {
        shows: shows || [],
        createShowAction: createShowAction,
        deleteShowAction: deleteShowAction
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/admin/shows/page.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
const $$RSC_SERVER_ACTION_0 = async function createShowAction(formData) {
    const showDate = String(formData.get("show_date") || "");
    const venue = String(formData.get("venue") || "");
    const token = createToken(showDate, venue);
    const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").insert({
        token,
        artist: String(formData.get("artist") || "Sonja Gründemann"),
        program: String(formData.get("program") || ""),
        show_date: showDate || null,
        weekday: getWeekday(showDate),
        venue,
        city: String(formData.get("city") || ""),
        start_time: String(formData.get("start_time") || ""),
        entry_time: String(formData.get("entry_time") || "")
    }).select("id").single();
    if (error || !data) {
        throw new Error(error?.message || "Show konnte nicht erstellt werden.");
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])(`/admin/shows/${data.id}`);
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_0, "402274442b32d392693ced387e9a15cafee8bb82f5", null);
var createShowAction = $$RSC_SERVER_ACTION_0;
const $$RSC_SERVER_ACTION_1 = async function deleteShowAction(formData) {
    const id = String(formData.get("show_id") || "");
    if (!id) return;
    await __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabaseAdmin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["supabaseAdmin"].from("shows").delete().eq("id", id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/admin");
};
(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])($$RSC_SERVER_ACTION_1, "40399aedbd592b32cca6cc84f2e7ee2cfb8cd7f91e", null);
var deleteShowAction = $$RSC_SERVER_ACTION_1;
function createToken(date, venue) {
    const cleanVenue = venue.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 18) || "show";
    const cleanDate = date ? date.replaceAll("-", "") : "date";
    const random = crypto.randomUUID().slice(0, 6);
    return `${cleanDate}-${cleanVenue}-${random}`;
}
function getWeekday(date) {
    if (!date) return null;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString("de-DE", {
        weekday: "long"
    }).toUpperCase();
}
}),
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)");
;
;
}),
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "402274442b32d392693ced387e9a15cafee8bb82f5",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_0"],
    "40399aedbd592b32cca6cc84f2e7ee2cfb8cd7f91e",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["$$RSC_SERVER_ACTION_1"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$shows$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/page/actions.js { ACTIONS_MODULE0 => "[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/page.tsx [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=primakavi-show-portal_0v2rma1._.js.map