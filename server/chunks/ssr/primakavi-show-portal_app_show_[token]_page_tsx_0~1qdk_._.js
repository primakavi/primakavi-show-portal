module.exports = [
"[project]/primakavi-show-portal/app/show/[token]/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ShowPortalPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/primakavi-show-portal/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
;
const CONTACTS = [
    {
        name: "Virena",
        role: "Booking & Organisation",
        email: "booking@primakavi.de",
        phone: "+4917615741674",
        whatsapp: "4917615741674",
        label: "VP"
    },
    {
        name: "Kathi",
        role: "Booking & Support",
        email: "booking@primakavi.de",
        phone: "+4917615741673",
        whatsapp: "4917615741673",
        label: "KM"
    },
    {
        name: "Sonja",
        role: "Künstlerin",
        email: "kontakt@sonja-gruendemann.de",
        phone: "+4915153140758",
        whatsapp: "4915153140758",
        label: "SG"
    }
];
const DOWNLOAD_URL = "https://typischfrau.de/veranstalterbereich/";
const DOWNLOAD_PASSWORD = "Backstage!26";
const FIELD_LABEL = "grid gap-2 text-xs font-black text-zinc-700";
const FIELD_CONTROL = "h-14 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100";
const FIELD_TEXTAREA = "rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-pink-300 focus:ring-4 focus:ring-pink-100";
function ShowPortalPage({ params }) {
    const { token } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["use"])(params);
    const [show, setShow] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({});
    const [files, setFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [fileType, setFileType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("Unterschriebener Vertrag");
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [uploadMessage, setUploadMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [saved, setSaved] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [dirty, setDirty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [lastSavedAt, setLastSavedAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const didLoad = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        async function loadData() {
            try {
                const res = await fetch(`/api/show/${token}`);
                if (!res.ok) throw new Error("Show konnte nicht geladen werden.");
                const data = await res.json();
                setShow(data.show || null);
                setForm(data.form || cleanShowForForm(data.show || {}));
                setLoading(false);
                didLoad.current = true;
                await loadFiles();
            } catch (err) {
                console.error(err);
                setError("Das Portal konnte nicht geladen werden.");
                setLoading(false);
            }
        }
        loadData();
    }, [
        token
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!didLoad.current || !dirty) return;
        const timer = window.setTimeout(()=>{
            save("auto");
        }, 1500);
        return ()=>window.clearTimeout(timer);
    }, [
        form,
        dirty
    ]);
    async function loadFiles() {
        const res = await fetch(`/api/show/${token}/files`);
        const data = await res.json();
        setFiles(data.files || []);
    }
    function updateField(field, value) {
        setSaved(false);
        setDirty(true);
        setError("");
        setForm((prev)=>({
                ...prev,
                [field]: value
            }));
    }
    function toggleListValue(field, value) {
        const current = form[field] ? form[field].split(",").map((item)=>item.trim()).filter(Boolean) : [];
        const next = current.includes(value) ? current.filter((item)=>item !== value) : [
            ...current,
            value
        ];
        updateField(field, next.join(", "));
    }
    function hasListValue(field, value) {
        return form[field]?.split(",").map((item)=>item.trim()).includes(value);
    }
    async function save(mode = "manual") {
        if (saving) return;
        try {
            setSaving(true);
            setError("");
            const res = await fetch(`/api/show/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(form)
            });
            if (!res.ok) {
                const data = await res.json().catch(()=>null);
                console.error("Speichern fehlgeschlagen:", data);
                throw new Error(data?.error || "Speichern fehlgeschlagen.");
            }
            setSaving(false);
            setSaved(true);
            setDirty(false);
            setLastSavedAt(new Date().toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit"
            }));
            if (mode === "manual") {
                setTimeout(()=>setSaved(false), 2500);
            }
        } catch (err) {
            console.error(err);
            setSaving(false);
            setError("Speichern nicht möglich. Bitte später erneut versuchen.");
        }
    }
    async function uploadFile(file) {
        if (!file) return;
        try {
            setUploading(true);
            setUploadMessage("");
            const data = new globalThis.FormData();
            data.append("file", file);
            data.append("file_type", fileType);
            const res = await fetch(`/api/show/${token}/files`, {
                method: "POST",
                body: data
            });
            if (!res.ok) throw new Error("Upload fehlgeschlagen.");
            setUploadMessage("Datei hochgeladen ✓");
            await loadFiles();
        } catch (err) {
            console.error(err);
            setUploadMessage("Upload nicht möglich. Bitte erneut versuchen.");
        } finally{
            setUploading(false);
        }
    }
    async function copyToken() {
        await navigator.clipboard.writeText(token);
        setSaved(true);
        setTimeout(()=>setSaved(false), 2000);
    }
    async function copyPassword() {
        await navigator.clipboard.writeText(DOWNLOAD_PASSWORD);
        setSaved(true);
        setTimeout(()=>setSaved(false), 2000);
    }
    const completion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        const items = [
            {
                label: "Veranstaltung",
                done: !!form.program && !!form.show_date && !!form.venue
            },
            {
                label: "Kontakt",
                done: !!form.contact_name && !!form.contact_email
            },
            {
                label: "Ablauf",
                done: !!form.entry_time && !!form.start_time
            },
            {
                label: "Technik",
                done: !!form.technik || !!form.tech_notes || !!form.sound_system
            },
            {
                label: "Vertrag / Finanzen",
                done: !!form.contract_status || !!form.fee || !!form.ticket_prices
            },
            {
                label: "Rechnung",
                done: !!form.invoice_email || !!form.invoice_address
            },
            {
                label: "Promotion",
                done: !!form.flyers_needed || !!form.posters_needed
            },
            {
                label: "Backstage / Catering",
                done: !!form.catering_status || !!form.backstage_equipment
            },
            {
                label: "Anreise / Unterkunft",
                done: !!form.accommodation_type || !!form.travel_details || !!form.anreise
            },
            {
                label: "Datei hochgeladen",
                done: files.length > 0
            }
        ];
        return items;
    }, [
        form,
        files.length
    ]);
    const progress = completion.filter((item)=>item.done).length;
    const missing = completion.filter((item)=>!item.done);
    const saveStatus = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        if (error) return error;
        if (saving) return "Speichert automatisch …";
        if (dirty) return "Änderungen noch nicht gespeichert";
        if (lastSavedAt) return `Zuletzt gespeichert um ${lastSavedAt} Uhr`;
        if (saved) return "Gespeichert. Danke euch! ✨";
        return "Ihr macht den Unterschied. 🙌";
    }, [
        dirty,
        error,
        lastSavedAt,
        saved,
        saving
    ]);
    const date = formatDate(form.show_date);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-screen items-center justify-center bg-[#fbf7ef] text-zinc-950",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl bg-white px-8 py-6 font-black shadow-xl",
                children: "Portal wird geladen …"
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 295,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
            lineNumber: 294,
            columnNumber: 7
        }, this);
    }
    if (!show) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "flex min-h-screen items-center justify-center bg-[#fbf7ef] text-zinc-950",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-3xl bg-white px-8 py-6 font-black shadow-xl",
                children: "Show wurde nicht gefunden."
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 305,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
            lineNumber: 304,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        className: "min-h-screen bg-[#fbf7ef] px-5 py-6 text-zinc-950",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-7xl pb-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                        className: "mb-6 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 text-3xl font-black tracking-tight",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-10 w-10 overflow-hidden rounded-xl bg-white shadow-md",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "/primakavi-logo.png",
                                                    alt: "primakavi",
                                                    className: "h-full w-full object-cover object-center"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 319,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 318,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: "primakavi"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 325,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 317,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "hidden text-xs font-black uppercase tracking-[0.25em] text-zinc-500 sm:block",
                                        children: "Show Portal"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 328,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 316,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative hidden items-center gap-3 sm:flex",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HelpButton, {}, void 0, false, {
                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                    lineNumber: 334,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 333,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 315,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "relative overflow-hidden rounded-[2rem] bg-zinc-950 px-8 py-12 text-white shadow-2xl",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(221,242,26,0.20),transparent_24%),radial-gradient(circle_at_24%_34%,rgba(168,85,247,0.26),transparent_30%),radial-gradient(circle_at_76%_62%,rgba(236,72,153,0.34),transparent_34%),radial-gradient(circle_at_92%_20%,rgba(221,242,26,0.15),transparent_24%)]"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 339,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_35%,rgba(255,255,255,0.03))]"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 340,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                className: "right-16 top-5 rotate-12 text-5xl text-[#DDF21A]/80",
                                children: "↘"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 342,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                className: "right-[11.25rem] bottom-5 rotate-[10deg] text-4xl text-pink-400/80",
                                children: "☆"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 345,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                className: "left-[52%] top-5 rotate-[8deg] text-8xl text-pink-400/80",
                                children: "♕"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 348,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative grid gap-10 lg:grid-cols-[1.25fr_0.8fr]",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mb-5 text-sm font-black uppercase tracking-[0.22em] text-zinc-300",
                                                children: "Veranstalter-Infos zum Auftritt"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 354,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                                className: "max-w-2xl text-5xl font-black leading-[1.02] tracking-tight md:text-6xl",
                                                children: "Schön, dass ihr Sonja dabei habt!"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 358,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-3 h-3 w-80 max-w-full rounded-full bg-gradient-to-r from-pink-500 via-pink-400 to-[#DDF21A] shadow-[0_0_30px_rgba(236,72,153,0.45)]"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 362,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-7 max-w-xl text-lg leading-8 text-zinc-200",
                                                children: "Bitte ergänzt alle wichtigen Infos zu Ablauf, Technik, Anreise und Unterkunft. So wird alles perfekt. 🤘"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 364,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 353,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "self-center rounded-[2rem] border border-white/15 bg-white/15 p-5 shadow-2xl backdrop-blur-2xl",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-[100px_1fr] gap-5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-3xl border border-white/10 bg-white/15 p-4 text-center shadow-inner",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs font-black uppercase text-zinc-300",
                                                            children: form.weekday || "SHOW"
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 373,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 text-5xl font-black",
                                                            children: date.day
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-sm font-black",
                                                            children: date.month
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 377,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-zinc-300",
                                                            children: date.year
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 378,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 372,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                            className: "text-xl font-black",
                                                            children: form.artist || "Sonja Gründemann"
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 382,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-1 font-semibold text-zinc-300",
                                                            children: form.program || "Jetzt mal Tacheles"
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 385,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-5 space-y-2 text-sm",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroPill, {
                                                                    children: [
                                                                        "◷ ",
                                                                        form.start_time || "20:00 Uhr",
                                                                        " · Einlass",
                                                                        " ",
                                                                        form.entry_time || "19:00 Uhr"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 390,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(HeroPill, {
                                                                    children: [
                                                                        "⌖ ",
                                                                        form.venue || "Location",
                                                                        ",",
                                                                        " ",
                                                                        form.city || "Ort offen"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 394,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 389,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 381,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 371,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 370,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 352,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 338,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-8 grid gap-8 lg:grid-cols-[1fr_340px]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                                className: "space-y-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "01",
                                        title: "Veranstaltung",
                                        doodle: "〰",
                                        doodleColor: "text-orange-400/55",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Programm",
                                                    value: form.program,
                                                    onChange: (v)=>updateField("program", v),
                                                    placeholder: "Jetzt mal Tacheles"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 414,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Datum",
                                                    type: "date",
                                                    value: form.show_date,
                                                    onChange: (v)=>updateField("show_date", v)
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 420,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Veranstaltungsort / Location",
                                                    value: form.venue,
                                                    onChange: (v)=>updateField("venue", v),
                                                    placeholder: "Name der Location"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 426,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Stadt / Ort",
                                                    value: form.city,
                                                    onChange: (v)=>updateField("city", v),
                                                    placeholder: "z.B. Hamburg"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 432,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Adresse",
                                                    value: form.venue_address,
                                                    onChange: (v)=>updateField("venue_address", v),
                                                    placeholder: "Straße, PLZ, Ort"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 438,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 413,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 407,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "02",
                                        title: "Organisation & Kontakt",
                                        doodle: "☆",
                                        doodleColor: "text-pink-400/60",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Ansprechpartner:in",
                                                    value: form.contact_name,
                                                    onChange: (v)=>updateField("contact_name", v),
                                                    placeholder: "Vor- und Nachname"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 454,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "E-Mail",
                                                    value: form.contact_email,
                                                    onChange: (v)=>updateField("contact_email", v),
                                                    placeholder: "name@beispiel.de"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 460,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Telefon",
                                                    value: form.contact_phone,
                                                    onChange: (v)=>updateField("contact_phone", v),
                                                    placeholder: "+49 123 456789"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 466,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                    label: "Mobilnummer für Zugang am Veranstaltungstag",
                                                    value: form.emergency_phone,
                                                    onChange: (v)=>updateField("emergency_phone", v),
                                                    placeholder: "+49 123 456789"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 472,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 453,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 447,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "03",
                                        title: "Ablauf & Planung",
                                        doodle: "↙",
                                        doodleColor: "text-orange-400/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Aufbauzeit / Soundcheck",
                                                        value: form.soundcheck_time,
                                                        onChange: (v)=>updateField("soundcheck_time", v),
                                                        placeholder: "z.B. 18:00 Uhr"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 488,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Einlass für die Gäste",
                                                        value: form.entry_time,
                                                        onChange: (v)=>updateField("entry_time", v),
                                                        placeholder: "z.B. 19:00 Uhr"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 494,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Showbeginn",
                                                        value: form.start_time,
                                                        onChange: (v)=>updateField("start_time", v),
                                                        placeholder: "z.B. 20:00 Uhr"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 500,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Gewünschte Ankunft",
                                                        value: form.arrival_time,
                                                        onChange: (v)=>updateField("arrival_time", v),
                                                        placeholder: "z.B. 17:30 Uhr"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 506,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 487,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Besonderheiten zum Ablauf",
                                                value: form.schedule,
                                                onChange: (v)=>updateField("schedule", v),
                                                placeholder: "Gibt es Besonderheiten, Hinweise oder Wünsche zum Ablauf?"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 514,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 481,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "04",
                                        title: "Technik",
                                        doodle: "♫",
                                        doodleColor: "text-purple-400/55",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                                                children: "Welche Technik ist vor Ort vorhanden?"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 528,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Checkbox, {
                                                        label: "Ton vorhanden",
                                                        checked: hasListValue("sound_system", "Ton vorhanden"),
                                                        onChange: ()=>toggleListValue("sound_system", "Ton vorhanden")
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 530,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Checkbox, {
                                                        label: "Licht vorhanden",
                                                        checked: hasListValue("lights", "Licht vorhanden"),
                                                        onChange: ()=>toggleListValue("lights", "Licht vorhanden")
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 537,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 529,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Ist ein Klavier oder Flügel vor Ort?",
                                                        value: form.piano,
                                                        onChange: (v)=>updateField("piano", v),
                                                        options: [
                                                            "Klavier",
                                                            "Flügel",
                                                            "Nein",
                                                            "Noch offen"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 545,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Ist ein E-Piano vor Ort?",
                                                        value: form.epiano,
                                                        onChange: (v)=>updateField("epiano", v),
                                                        options: [
                                                            "Ja",
                                                            "Nein",
                                                            "Noch offen"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 551,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Marke / Modell",
                                                        value: form.piano_notes,
                                                        onChange: (v)=>updateField("piano_notes", v),
                                                        placeholder: "z.B. Yamaha CP88, Stimmung etc."
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 557,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Technik-Ansprechpartner",
                                                        value: form.tech_contact,
                                                        onChange: (v)=>updateField("tech_contact", v),
                                                        placeholder: "Name & Kontakt"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 563,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 544,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Besonderheiten zur Technik",
                                                value: form.technik,
                                                onChange: (v)=>updateField("technik", v),
                                                placeholder: "Alles, was wir technisch wissen sollten."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 571,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 522,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "05",
                                        title: "Vertrag & Finanzen",
                                        doodle: "♡",
                                        doodleColor: "text-orange-400/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Aktueller Vertragsstatus",
                                                        value: form.contract_status,
                                                        onChange: (v)=>updateField("contract_status", v),
                                                        options: [
                                                            "Vertrag liegt vor",
                                                            "In Vorbereitung",
                                                            "Noch offen",
                                                            "Wird separat per E-Mail geregelt",
                                                            "Bitte sende mir einen Vertrag zu"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 586,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Honorar",
                                                        value: form.fee,
                                                        onChange: (v)=>updateField("fee", v),
                                                        placeholder: "netto / brutto"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 598,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Eintrittspreise",
                                                        value: form.ticket_prices,
                                                        onChange: (v)=>updateField("ticket_prices", v),
                                                        placeholder: "regulär / ermäßigt / VVK / AK"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 604,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Anzahl Plätze / Kapazität",
                                                        value: form.capacity,
                                                        onChange: (v)=>updateField("capacity", v),
                                                        placeholder: "z.B. 220"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 610,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Rechnungs-E-Mail",
                                                        value: form.invoice_email,
                                                        onChange: (v)=>updateField("invoice_email", v),
                                                        placeholder: "rechnung@beispiel.de"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 616,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Bestellnummer / PO-Nummer",
                                                        value: form.po_number,
                                                        onChange: (v)=>updateField("po_number", v),
                                                        placeholder: "falls benötigt"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 622,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 585,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                label: "Ticketlink",
                                                value: form.ticket_link,
                                                onChange: (v)=>updateField("ticket_link", v),
                                                placeholder: "https://..."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 630,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Rechnungsadresse",
                                                value: form.invoice_address,
                                                onChange: (v)=>updateField("invoice_address", v),
                                                placeholder: "Firma / Einrichtung, Straße, PLZ Ort, ggf. Abteilung"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 637,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Hinweise zur Rechnung / Vertrag",
                                                value: form.contract_notes,
                                                onChange: (v)=>updateField("contract_notes", v),
                                                placeholder: "Besonderheiten zur Abrechnung, Vertrag, Bestellnummer etc."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 644,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 579,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "06",
                                        title: "Promotion",
                                        doodle: "✦",
                                        doodleColor: "text-pink-400/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Anzahl Freikarten",
                                                        value: form.free_tickets,
                                                        onChange: (v)=>updateField("free_tickets", v),
                                                        placeholder: "falls vereinbart"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 659,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Werden Flyer benötigt?",
                                                        value: form.flyers_needed,
                                                        onChange: (v)=>updateField("flyers_needed", v),
                                                        options: [
                                                            "Ja",
                                                            "Nein",
                                                            "Noch offen"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 665,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Anzahl Flyer",
                                                        value: form.flyer_amount,
                                                        onChange: (v)=>updateField("flyer_amount", v),
                                                        placeholder: "falls bekannt"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 671,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Werden Plakate benötigt?",
                                                        value: form.posters_needed,
                                                        onChange: (v)=>updateField("posters_needed", v),
                                                        options: [
                                                            "Ja",
                                                            "Nein",
                                                            "Noch offen"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 677,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 658,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                label: "Plakate: Anzahl & Größe",
                                                value: form.poster_details,
                                                onChange: (v)=>updateField("poster_details", v),
                                                placeholder: "z.B. 20 x A2"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 685,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Weitere Hinweise zur Promotion",
                                                value: form.promotion,
                                                onChange: (v)=>updateField("promotion", v),
                                                placeholder: "Alles, was für Werbung und Ankündigung wichtig ist."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 691,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 652,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "07",
                                        title: "Verpflegung & Extras",
                                        doodle: "〰",
                                        doodleColor: "text-teal-500/55",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                        label: "Catering / Getränke vorgesehen?",
                                                        value: form.catering_status,
                                                        onChange: (v)=>updateField("catering_status", v),
                                                        options: [
                                                            "Ja",
                                                            "Nein",
                                                            "Noch offen"
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 706,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Input, {
                                                        label: "Details Catering",
                                                        value: form.catering_details,
                                                        onChange: (v)=>updateField("catering_details", v),
                                                        placeholder: "Getränke, Snacks, Besonderheiten..."
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 712,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 705,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                                                children: "Garderobe / Backstage-Ausstattung"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 720,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    "Raum vorhanden",
                                                    "Spiegel vorhanden",
                                                    "Sitzgelegenheit",
                                                    "Tisch",
                                                    "Kein Backstage Raum vorhanden"
                                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Checkbox, {
                                                        label: item,
                                                        checked: hasListValue("backstage_equipment", item),
                                                        onChange: ()=>toggleListValue("backstage_equipment", item)
                                                    }, item, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 729,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 721,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 699,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "08",
                                        title: "Unterkunft & Anreise",
                                        doodle: "↗",
                                        doodleColor: "text-orange-400/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Select, {
                                                label: "Wie ist die Unterkunft geregelt?",
                                                value: form.accommodation_type,
                                                onChange: (v)=>updateField("accommodation_type", v),
                                                options: [
                                                    "Hotel wird vom Veranstalter gestellt",
                                                    "Hotel-Buyout wird gezahlt",
                                                    "Hotel organisiert Sonja selbst",
                                                    "Keine Übernachtung notwendig",
                                                    "Sonstiges"
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 747,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Sonstiges zur Unterkunft",
                                                value: form.unterkunft,
                                                onChange: (v)=>updateField("unterkunft", v),
                                                placeholder: "Buyout-Betrag, Hotel, Sonderregelungen..."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 760,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BlockTitle, {
                                                children: "Wie ist die Anreise organisiert?"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 767,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactGrid, {
                                                children: [
                                                    "Parkplatz vor Ort vorhanden",
                                                    "Ladezone / direkter Bühneneingang vorhanden",
                                                    "Keine Parkmöglichkeit vor Ort",
                                                    "Anreise mit öffentlichen Verkehrsmitteln empfohlen",
                                                    "Sonstiges"
                                                ].map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Checkbox, {
                                                        label: item,
                                                        checked: hasListValue("travel_options", item),
                                                        onChange: ()=>toggleListValue("travel_options", item)
                                                    }, item, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 776,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 768,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                                label: "Details zur Anreise",
                                                value: form.anreise,
                                                onChange: (v)=>updateField("anreise", v),
                                                placeholder: "Parkhaus-Adresse, Einfahrt, Schranke, Klingel, Durchfahrtshöhe..."
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 785,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 741,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "09",
                                        title: "Sonstiges",
                                        doodle: "?",
                                        doodleColor: "text-zinc-400/60",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Textarea, {
                                            label: "Gibt es noch etwas, das wir wissen sollten?",
                                            value: form.general_notes,
                                            onChange: (v)=>updateField("general_notes", v),
                                            placeholder: "Weitere Hinweise oder Besonderheiten..."
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 799,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 793,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "10",
                                        title: "Dateien & Unterlagen",
                                        doodle: "✈",
                                        doodleColor: "text-purple-400/60",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid gap-4 md:grid-cols-[260px_1fr]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: FIELD_LABEL,
                                                        children: [
                                                            "Was wird hochgeladen?",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                                value: fileType,
                                                                onChange: (e)=>setFileType(e.target.value),
                                                                className: FIELD_CONTROL,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Unterschriebener Vertrag"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 821,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Technikplan Bühne / Raum"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 822,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Saalplan / Bestuhlungsplan"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 823,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Anfahrts- / Ladeinfos"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 824,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Rechnungs- / Bestellunterlage"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 825,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                        children: "Sonstiges"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 826,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                lineNumber: 816,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 814,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                        className: "flex cursor-pointer items-center justify-center gap-4 rounded-2xl bg-white px-5 py-5 text-left transition hover:scale-[1.01] hover:bg-white/90",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-2xl",
                                                                children: "⇧"
                                                            }, void 0, false, {
                                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                lineNumber: 831,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "font-black text-purple-900",
                                                                        children: uploading ? "Upload läuft …" : "Datei auswählen"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 835,
                                                                        columnNumber: 21
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "mt-1 text-sm font-semibold text-purple-700",
                                                                        children: "Vertrag, Technikplan, Saalplan, Anfahrtsinfos oder weitere Unterlagen"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                        lineNumber: 838,
                                                                        columnNumber: 21
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                lineNumber: 834,
                                                                columnNumber: 19
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "file",
                                                                className: "hidden",
                                                                disabled: uploading,
                                                                onChange: (e)=>uploadFile(e.target.files?.[0] || null)
                                                            }, void 0, false, {
                                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                lineNumber: 843,
                                                                columnNumber: 19
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 830,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 813,
                                                columnNumber: 15
                                            }, this),
                                            uploadMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-purple-800",
                                                children: uploadMessage
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 853,
                                                columnNumber: 17
                                            }, this),
                                            files.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-sm font-black text-purple-900",
                                                        children: "Hochgeladene Dateien"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 860,
                                                        columnNumber: 19
                                                    }, this),
                                                    files.map((file)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "min-w-0",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "truncate font-black text-zinc-900",
                                                                            children: file.file_name
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                            lineNumber: 869,
                                                                            columnNumber: 25
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: "text-xs font-semibold text-zinc-500",
                                                                            children: [
                                                                                file.file_type,
                                                                                " · ",
                                                                                formatBytes(file.size_bytes)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                            lineNumber: 872,
                                                                            columnNumber: 25
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 868,
                                                                    columnNumber: 23
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "shrink-0 rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700",
                                                                    children: "hochgeladen"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 876,
                                                                    columnNumber: 23
                                                                }, this)
                                                            ]
                                                        }, file.id, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 864,
                                                            columnNumber: 21
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 859,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 807,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(FormSection, {
                                        number: "11",
                                        title: "Downloads & Materialien",
                                        doodle: "↓",
                                        doodleColor: "text-[#DDF21A]/80",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid gap-5 md:grid-cols-[1fr_auto] md:items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-lg font-black text-zinc-900",
                                                            children: "Veranstalterbereich öffnen"
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 893,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "mt-2 max-w-3xl text-sm font-semibold leading-6 text-zinc-600",
                                                            children: "Hier findet ihr Bühnenanweisung, GEMA-Liste, Plakate, Szenenfotos und weitere Materialien zur Vorbereitung."
                                                        }, void 0, false, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 896,
                                                            columnNumber: 19
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm font-semibold text-zinc-700",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: [
                                                                        "Passwort:",
                                                                        " ",
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "font-black text-zinc-950",
                                                                            children: DOWNLOAD_PASSWORD
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                            lineNumber: 904,
                                                                            columnNumber: 23
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 902,
                                                                    columnNumber: 21
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: copyPassword,
                                                                    className: "rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700",
                                                                    children: "kopieren"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                                    lineNumber: 908,
                                                                    columnNumber: 21
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                            lineNumber: 901,
                                                            columnNumber: 19
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 892,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                    href: DOWNLOAD_URL,
                                                    target: "_blank",
                                                    rel: "noopener noreferrer",
                                                    className: "flex h-16 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-400 to-[#DDF21A] px-8 text-base font-black text-white shadow-lg transition hover:scale-[1.03]",
                                                    children: "Bereich öffnen →"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 918,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 891,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 885,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 406,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                                className: "space-y-6 lg:sticky lg:top-6 lg:self-start",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                        title: "Status der Angaben",
                                        tone: "purple",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-3 flex items-center justify-between",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-black text-purple-700",
                                                    children: [
                                                        progress,
                                                        " / ",
                                                        completion.length,
                                                        " erledigt"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 933,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 932,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mb-5 h-2 rounded-full bg-purple-200",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-2 rounded-full bg-purple-500 transition-all",
                                                    style: {
                                                        width: `${progress / completion.length * 100}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 938,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 937,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-3",
                                                children: completion.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Status, {
                                                        label: item.label,
                                                        done: item.done
                                                    }, item.label, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 948,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 946,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 931,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                        title: "Noch offen",
                                        tone: missing.length === 0 ? "teal" : "amber",
                                        children: missing.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-bold leading-6 text-zinc-700",
                                            children: "Alles bereit 🎉 Danke fürs Ausfüllen."
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 958,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-3",
                                            children: missing.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "rounded-2xl bg-white/70 px-4 py-3 text-sm font-bold text-zinc-700",
                                                    children: item.label
                                                }, item.label, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 964,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 962,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 953,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                        title: "Show-ID",
                                        tone: "zinc",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "break-all font-mono text-lg font-black",
                                                    children: token
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 977,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: copyToken,
                                                    className: "rounded-2xl bg-white px-3 py-2 text-sm font-black transition hover:bg-zinc-100",
                                                    children: "⧉"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 978,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 976,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 975,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(SideCard, {
                                        title: "Hinweis",
                                        tone: "amber",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "relative",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                                    className: "right-2 top-0 rotate-12 text-3xl text-orange-400/50",
                                                    children: "♢"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 990,
                                                    columnNumber: 17
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-semibold leading-7 text-zinc-700",
                                                    children: "Nicht alles muss bereits feststehen. Offene Punkte können leer bleiben oder mit „noch offen“ beantwortet werden."
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 993,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 989,
                                            columnNumber: 15
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 988,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "relative rounded-[1.75rem] bg-teal-100 p-6 pb-0 shadow-xl shadow-zinc-200/80",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                                className: "left-[10.75rem] top-[10.5rem] rotate-[18deg] text-8xl text-purple-500/80",
                                                children: "♕"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1001,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                                                className: "right-4 top-[10.25rem] rotate-[8deg] text-5xl text-pink-400/80",
                                                children: "♡"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1004,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-lg font-black",
                                                children: "Fragen?"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1008,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-1 text-sm font-semibold text-zinc-700",
                                                children: "Wir sind für euch da!"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1009,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-5 space-y-3 text-sm font-semibold",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: "✉ booking@primakavi.de"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 1014,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: "☏ Virena: +49 176 1574 1674"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 1015,
                                                        columnNumber: 17
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        children: "☏ Kathi: +49 176 1574 1673"
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 1016,
                                                        columnNumber: 17
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "relative mt-5 h-80 overflow-visible",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "/team.png",
                                                    alt: "Team primakavi",
                                                    className: "absolute bottom-[-65px] right-[-48px] h-[128%] w-auto object-contain drop-shadow-2xl"
                                                }, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 1020,
                                                    columnNumber: 17
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1019,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1000,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 930,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 405,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "sticky bottom-5 z-20 mt-8 rounded-[1.75rem] bg-zinc-950 p-4 text-white shadow-2xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-black",
                                            children: "💗 Danke für eure Unterstützung!"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 1033,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: `text-sm ${error ? "text-red-300" : dirty ? "text-yellow-200" : "text-zinc-300"}`,
                                            children: saved && !dirty ? "Danke! Eure Angaben sind bei uns angekommen." : saveStatus
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 1034,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                    lineNumber: 1032,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "hidden text-right text-sm text-zinc-400 sm:block",
                                            children: [
                                                "Autosave aktiv",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("br", {}, void 0, false, {
                                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                    lineNumber: 1052,
                                                    columnNumber: 17
                                                }, this),
                                                "manuell speichern möglich"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 1050,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>save("manual"),
                                            disabled: saving,
                                            className: "rounded-full bg-gradient-to-r from-pink-400 to-orange-400 px-9 py-4 font-black text-white shadow-lg transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70",
                                            children: saving ? "Speichert …" : saved && !dirty ? "Gespeichert ✓" : "Angaben speichern →"
                                        }, void 0, false, {
                                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                            lineNumber: 1056,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                    lineNumber: 1049,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                            lineNumber: 1031,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1030,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 314,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "mt-6 text-center text-xs font-semibold text-zinc-500",
                children: "Die Angaben werden ausschließlich zur Vorbereitung des Auftritts genutzt."
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1073,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 313,
        columnNumber: 5
    }, this);
}
function cleanShowForForm(show) {
    const result = {};
    Object.entries(show || {}).forEach(([key, value])=>{
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            result[key] = String(value);
        }
    });
    return result;
}
function HelpButton() {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return ()=>document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        ref: ref,
        className: "relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                onClick: ()=>setOpen((prev)=>!prev),
                className: "group flex cursor-pointer items-center gap-5 rounded-full bg-white px-6 py-4 shadow-md transition hover:-translate-y-0.5 hover:shadow-xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-right",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-lg font-black text-zinc-950",
                                children: "Fragen?"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1119,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-semibold text-zinc-500 group-hover:text-zinc-700",
                                children: "Wir helfen gern."
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1120,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex -space-x-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                        initials: "VP"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1127,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                        initials: "KM"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1128,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                        initials: "SG"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1129,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1126,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xl font-black text-zinc-900 transition group-hover:translate-x-1",
                                children: "→"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1132,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1125,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1113,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute right-0 top-20 z-50 w-80 rounded-[1.75rem] bg-white p-5 shadow-2xl shadow-zinc-300/70",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mb-4 flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-lg font-black text-zinc-950",
                                        children: "Kontakt"
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1142,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-semibold text-zinc-500",
                                        children: "Direkt erreichbar."
                                    }, void 0, false, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1143,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1141,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setOpen(false),
                                className: "flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-sm font-black transition hover:bg-zinc-200",
                                children: "×"
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1148,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1140,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-3",
                        children: CONTACTS.map((contact)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-2xl bg-zinc-50 p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Avatar, {
                                                initials: contact.label,
                                                small: true
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1161,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "font-black text-zinc-950",
                                                        children: contact.name
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 1164,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-bold text-zinc-500",
                                                        children: contact.role
                                                    }, void 0, false, {
                                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                        lineNumber: 1165,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1163,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1160,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-3 flex flex-wrap gap-2 text-xs font-black",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `mailto:${contact.email}`,
                                                className: "rounded-full bg-pink-100 px-3 py-2 text-pink-700 transition hover:bg-pink-200",
                                                children: "✉ Mail"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1172,
                                                columnNumber: 19
                                            }, this),
                                            contact.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `tel:${contact.phone}`,
                                                className: "rounded-full bg-purple-100 px-3 py-2 text-purple-700 transition hover:bg-purple-200",
                                                children: "☎ Anrufen"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1180,
                                                columnNumber: 21
                                            }, this),
                                            contact.whatsapp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(`Hallo ${contact.name}, ich habe eine Frage zum Auftritt von Sonja 🙂`)}`,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                className: "rounded-full bg-emerald-100 px-3 py-2 text-emerald-700 transition hover:bg-emerald-200",
                                                children: "💬 WhatsApp"
                                            }, void 0, false, {
                                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                                lineNumber: 1189,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                        lineNumber: 1171,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, contact.name, true, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1159,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1157,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1139,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1112,
        columnNumber: 5
    }, this);
}
function CompactGrid({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "grid gap-4 md:grid-cols-2",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1211,
        columnNumber: 10
    }, this);
}
function BlockTitle({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-sm font-black text-zinc-700",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1215,
        columnNumber: 10
    }, this);
}
function getSectionTheme(title) {
    const themes = {
        Veranstaltung: {
            shell: "border-purple-200 bg-purple-50/60",
            number: "from-purple-200 to-pink-300"
        },
        "Organisation & Kontakt": {
            shell: "border-pink-200 bg-pink-50/60",
            number: "from-pink-200 to-rose-300"
        },
        "Ablauf & Planung": {
            shell: "border-orange-200 bg-orange-50/60",
            number: "from-amber-200 to-orange-300"
        },
        Technik: {
            shell: "border-purple-200 bg-purple-50/60",
            number: "from-purple-200 to-fuchsia-300"
        },
        "Vertrag & Finanzen": {
            shell: "border-orange-200 bg-orange-50/60",
            number: "from-orange-200 to-red-300"
        },
        Promotion: {
            shell: "border-pink-200 bg-pink-50/60",
            number: "from-pink-200 to-rose-300"
        },
        "Verpflegung & Extras": {
            shell: "border-teal-200 bg-teal-50/60",
            number: "from-teal-200 to-emerald-300"
        },
        "Unterkunft & Anreise": {
            shell: "border-amber-200 bg-amber-50/60",
            number: "from-amber-200 to-orange-300"
        },
        "Dateien & Unterlagen": {
            shell: "border-purple-300 bg-purple-50/60",
            number: "from-purple-200 to-fuchsia-300"
        },
        Sonstiges: {
            shell: "border-zinc-200 bg-zinc-50/70",
            number: "from-zinc-200 to-zinc-300"
        },
        "Downloads & Materialien": {
            shell: "border-lime-200 bg-lime-50/60",
            number: "from-[#DDF21A] to-pink-300"
        }
    };
    return themes[title] ?? {
        shell: "border-zinc-200 bg-zinc-50/60",
        number: "from-zinc-200 to-zinc-300"
    };
}
function FormSection({ number, title, doodle, doodleColor, children }) {
    const theme = getSectionTheme(title);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "relative rounded-[1.75rem] bg-white p-6 shadow-xl shadow-zinc-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Doodle, {
                className: `right-7 top-7 rotate-[-8deg] text-3xl ${doodleColor}`,
                children: doodle
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1291,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-6 flex items-start gap-5",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${theme.number} text-xl font-black text-zinc-900`,
                        children: number
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1298,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-2xl font-black tracking-tight text-zinc-950",
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1305,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm font-semibold text-zinc-500",
                                children: sectionDescription(title)
                            }, void 0, false, {
                                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                                lineNumber: 1308,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1304,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1297,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `grid gap-5 rounded-3xl border-2 border-dashed p-5 ${theme.shell}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1314,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1290,
        columnNumber: 5
    }, this);
}
function SideCard({ title, children, tone = "zinc" }) {
    const styles = {
        zinc: "border-zinc-200 bg-zinc-50/70",
        purple: "border-purple-200 bg-purple-50/70",
        amber: "border-amber-200 bg-amber-50/70",
        teal: "border-teal-200 bg-teal-50/70"
    }[tone];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "rounded-[1.75rem] bg-white p-5 shadow-xl shadow-zinc-200/70",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "mb-4 text-lg font-black text-zinc-950",
                children: title
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1341,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `rounded-3xl border-2 border-dashed p-4 ${styles}`,
                children: children
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1342,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1340,
        columnNumber: 5
    }, this);
}
function sectionDescription(title) {
    const descriptions = {
        Veranstaltung: "Grunddaten zum Auftritt.",
        "Organisation & Kontakt": "Wer ist vor Ort erreichbar?",
        "Ablauf & Planung": "Alles für Timing und Ablauf.",
        Technik: "Bitte so konkret wie möglich.",
        "Vertrag & Finanzen": "Vertrag, Honorar und Rechnungsdaten.",
        Promotion: "Werbematerial und Ankündigungen.",
        "Verpflegung & Extras": "Backstage, Garderobe und Catering.",
        "Unterkunft & Anreise": "Hotel, Anfahrt und Besonderheiten.",
        "Dateien & Unterlagen": "Verträge, Pläne und weitere Unterlagen.",
        Sonstiges: "Alles, was sonst noch wichtig ist.",
        "Downloads & Materialien": "Materialien zur Vorbereitung."
    };
    return descriptions[title] ?? "";
}
function formatDate(date) {
    if (!date) return {
        day: "24",
        month: "APR",
        year: "2026"
    };
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return {
        day: "24",
        month: "APR",
        year: "2026"
    };
    return {
        day: String(d.getDate()).padStart(2, "0"),
        month: d.toLocaleDateString("de-DE", {
            month: "short"
        }).replace(".", "").toUpperCase(),
        year: String(d.getFullYear())
    };
}
function formatBytes(bytes) {
    if (!bytes) return "Größe unbekannt";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function Avatar({ initials, small = false }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `flex items-center justify-center rounded-full border-2 border-white bg-zinc-900 font-black text-white ${small ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm"}`,
        children: initials
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1399,
        columnNumber: 5
    }, this);
}
function Doodle({ children, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        className: `pointer-events-none absolute select-none font-black leading-none opacity-60 ${className}`,
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1417,
        columnNumber: 5
    }, this);
}
function HeroPill({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-2xl bg-white/10 px-4 py-3 font-semibold text-zinc-100",
        children: children
    }, void 0, false, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1427,
        columnNumber: 5
    }, this);
}
function Status({ label, value, done, variant = "amber" }) {
    const text = value || (done ? "Erledigt" : "Offen");
    const styles = done ? "bg-emerald-100 text-emerald-700" : variant === "purple" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center justify-between border-b border-white/70 pb-3 text-sm last:border-0 last:pb-0",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-bold text-zinc-800",
                children: label
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1453,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `rounded-full px-3 py-1 text-xs font-black ${styles}`,
                children: text
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1454,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1452,
        columnNumber: 5
    }, this);
}
function Input({ label, placeholder, value, onChange, type = "text" }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: FIELD_LABEL,
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: type,
                value: value || "",
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder,
                className: FIELD_CONTROL
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1477,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1475,
        columnNumber: 5
    }, this);
}
function Textarea({ label, placeholder, value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: FIELD_LABEL,
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                rows: 4,
                value: value || "",
                onChange: (e)=>onChange(e.target.value),
                placeholder: placeholder,
                className: FIELD_TEXTAREA
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1502,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1500,
        columnNumber: 5
    }, this);
}
function Select({ label, value, onChange, options = [
    "Ja",
    "Nein",
    "Noch offen",
    "Nicht relevant"
] }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: FIELD_LABEL,
        children: [
            label,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                value: value || "",
                onChange: (e)=>onChange(e.target.value),
                className: FIELD_CONTROL,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: "",
                        children: "Bitte auswählen"
                    }, void 0, false, {
                        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                        lineNumber: 1532,
                        columnNumber: 9
                    }, this),
                    options.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                            children: option
                        }, option, false, {
                            fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                            lineNumber: 1534,
                            columnNumber: 11
                        }, this))
                ]
            }, void 0, true, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1527,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1525,
        columnNumber: 5
    }, this);
}
function Checkbox({ label, checked, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: onChange,
        className: `flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold transition hover:bg-white/90 ${checked ? "text-zinc-950 shadow-sm" : "text-zinc-600"}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$primakavi$2d$show$2d$portal$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: `h-4 w-4 rounded-full border-2 ${checked ? "border-purple-500 bg-purple-500" : "border-zinc-300"}`
            }, void 0, false, {
                fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
                lineNumber: 1558,
                columnNumber: 7
            }, this),
            label
        ]
    }, void 0, true, {
        fileName: "[project]/primakavi-show-portal/app/show/[token]/page.tsx",
        lineNumber: 1551,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=primakavi-show-portal_app_show_%5Btoken%5D_page_tsx_0~1qdk_._.js.map