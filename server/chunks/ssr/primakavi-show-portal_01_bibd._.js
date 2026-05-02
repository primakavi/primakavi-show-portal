module.exports = [
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
"[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"40e1014352aa1698c3d93785177775647a80de33bf":{"name":"saveAkteAction"}},"primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts",""] */ __turbopack_context__.s([
    "saveAkteAction",
    ()=>saveAkteAction
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function saveAkteAction(formData) {
    const supabase = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createClient"])();
    const showId = String(formData.get("show_id"));
    const showPayload = {
        artist: value(formData, "artist"),
        program: value(formData, "program"),
        show_date: value(formData, "show_date"),
        weekday: value(formData, "weekday"),
        venue: value(formData, "venue"),
        city: value(formData, "city"),
        start_time: value(formData, "start_time"),
        entry_time: value(formData, "entry_time")
    };
    const detailsPayload = {
        show_id: showId,
        contact_name: value(formData, "contact_name"),
        contact_email: value(formData, "contact_email"),
        contact_phone: value(formData, "contact_phone"),
        venue_address: value(formData, "venue_address"),
        schedule: value(formData, "schedule"),
        technik: value(formData, "technik"),
        piano: value(formData, "piano"),
        sound: value(formData, "sound"),
        light: value(formData, "light"),
        anreise: value(formData, "anreise"),
        unterkunft: value(formData, "unterkunft"),
        vertrag: value(formData, "vertrag"),
        tickets: value(formData, "tickets"),
        promotion: value(formData, "promotion"),
        general_notes: value(formData, "general_notes")
    };
    const adminPayload = {
        show_id: showId,
        internal_status: value(formData, "internal_status"),
        billing_status: value(formData, "billing_status"),
        next_step: value(formData, "next_step"),
        follow_up_date: value(formData, "follow_up_date"),
        internal_notes: value(formData, "internal_notes"),
        markus_included: formData.get("markus_included") === "on",
        checklist: {
            portal: formData.get("checklist_portal") === "on",
            technik: formData.get("checklist_technik") === "on",
            vertrag: formData.get("checklist_vertrag") === "on",
            promotion: formData.get("checklist_promotion") === "on",
            abrechnung: formData.get("checklist_abrechnung") === "on"
        }
    };
    await supabase.from("shows").update(showPayload).eq("id", showId);
    await supabase.from("show_details").upsert(detailsPayload, {
        onConflict: "show_id"
    });
    await supabase.from("show_admin_notes").upsert(adminPayload, {
        onConflict: "show_id"
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/admin");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/admin/shows/${showId}`);
}
function value(formData, key) {
    const raw = formData.get(key);
    if (raw === null) return null;
    const stringValue = String(raw).trim();
    return stringValue === "" ? null : stringValue;
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveAkteAction
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveAkteAction, "40e1014352aa1698c3d93785177775647a80de33bf", null);
}),
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$saveAkteAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)");
;
}),
"[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => \"[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "40e1014352aa1698c3d93785177775647a80de33bf",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$saveAkteAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveAkteAction"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f2e$next$2d$internal$2f$server$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$saveAkteAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/primakavi-show-portal/.next-internal/server/app/admin/shows/[id]/page/actions.js { ACTIONS_MODULE0 => "[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$app$2f$admin$2f$shows$2f5b$id$5d2f$saveAkteAction$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/app/admin/shows/[id]/saveAkteAction.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=primakavi-show-portal_01_bibd._.js.map