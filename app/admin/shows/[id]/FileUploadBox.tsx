"use client";

import { useState } from "react";

export default function FileUploadBox({ token }: { token: string }) {
  const [fileType, setFileType] = useState("Unterschriebener Vertrag");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadFile(file: File | null) {
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");

      const data = new FormData();
      data.append("file", file);
      data.append("file_type", fileType);

      const res = await fetch(`/api/show/${token}/files`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Upload fehlgeschlagen");

      setMessage("Datei hochgeladen ✓ Bitte Seite neu laden.");
    } catch (err) {
      console.error(err);
      setMessage("Upload nicht möglich.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <label className="grid gap-2 text-xs font-black text-zinc-700">
        Dateityp
        <select
          value={fileType}
          onChange={(e) => setFileType(e.target.value)}
          className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none focus:border-pink-300 focus:ring-4 focus:ring-pink-100"
        >
          <option>Unterschriebener Vertrag</option>
          <option>Vertrag vom Veranstalter</option>
          <option>Technikplan Bühne / Raum</option>
          <option>Saalplan / Bestuhlungsplan</option>
          <option>Anfahrts- / Ladeinfos</option>
          <option>Rechnungs- / Bestellunterlage</option>
          <option>Sonstiges</option>
        </select>
      </label>

      <label className="flex cursor-pointer items-center justify-center rounded-2xl bg-zinc-950 px-4 py-3 text-sm font-black text-white transition hover:scale-[1.01]">
        {uploading ? "Upload läuft …" : "Datei hochladen →"}
        <input
          type="file"
          className="hidden"
          disabled={uploading}
          onChange={(e) => uploadFile(e.target.files?.[0] || null)}
        />
      </label>

      {message && (
        <p className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-zinc-700">
          {message}
        </p>
      )}
    </div>
  );
}