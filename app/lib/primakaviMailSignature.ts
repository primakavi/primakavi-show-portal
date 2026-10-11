/** primakavi booking signature. The logo is embedded as a CID MIME attachment. */
export const PRIMAKAVI_LOGO_CID = "primakavi-logo@booking.primakavi.de";

export const PRIMAKAVI_SIGNATURE_TEXT = [
  "Virena Prior", "ARTIST BOOKING", "booking@primakavi.de", "www.primakavi.de",
  "Instagram: https://www.instagram.com/primakavi.booking/",
  "YouTube: https://www.youtube.com/@primakaviBooking", "#gerneperdu",
].join("\n");

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Converts only safe Markdown links; all other text remains escaped. */
function asHtmlLines(value: string): string {
  const linkPattern = /\[([^\]\r\n]+)\]\((https?:\/\/[^\s<>"'()]+(?:\([^\s<>"'()]*\)[^\s<>"'()]*)*)\)/g;
  let html = "";
  let cursor = 0;
  for (const match of value.matchAll(linkPattern)) {
    const index = match.index ?? 0;
    html += escapeHtml(value.slice(cursor, index));
    const label = match[1];
    const url = match[2];
    html += `<a href="${escapeHtml(url)}" style="color:#17385f;text-decoration:underline;">${escapeHtml(label)}</a>`;
    cursor = index + match[0].length;
  }
  html += escapeHtml(value.slice(cursor));
  return html.replace(/\r\n?|\n/g, "<br>");
}

/** Builds a complete HTML email without accepting untrusted HTML from the browser. */
export function buildPrimakaviMailHtml(message: string, quote = ""): string {
  const logoUrl = `cid:${PRIMAKAVI_LOGO_CID}`;
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;color:#111111;font-family:Aptos,Arial,Helvetica,sans-serif;">
<div style="font-size:14px;line-height:1.55;white-space:normal;">${asHtmlLines(message)}</div>
<div style="height:22px;line-height:22px;">&nbsp;</div>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;font-family:Aptos,Arial,Helvetica,sans-serif;">
<tr><td style="padding:0 20px 0 0;vertical-align:middle;">
<a href="https://www.primakavi.de/" style="text-decoration:none;"><img src="${logoUrl}" alt="primakavi" width="145" style="width:145px;height:auto;display:block;border:0;"></a>
</td><td style="background-color:#e9f20f;width:3px;font-size:0;line-height:0;">&nbsp;</td>
<td style="padding:0 0 0 20px;vertical-align:top;color:#111111;">
<div style="font-size:20px;font-weight:700;line-height:24px;">Virena Prior</div>
<div style="font-size:11px;line-height:17px;letter-spacing:2px;font-weight:700;margin-bottom:9px;">ARTIST BOOKING</div>
<div style="font-size:13px;line-height:20px;"><a href="mailto:booking@primakavi.de" style="color:#111111;text-decoration:none;">booking@primakavi.de</a><br><a href="https://www.primakavi.de/" style="color:#111111;text-decoration:none;">www.primakavi.de</a></div>
<div style="font-size:16px;line-height:20px;margin-top:6px;font-weight:700;"><a href="https://www.instagram.com/primakavi.booking/" style="color:#111111;text-decoration:none;">Instagram</a> <span style="color:#e9f20f;">&bull;</span> <a href="https://www.youtube.com/@primakaviBooking" style="color:#111111;text-decoration:none;">YouTube</a></div>
<div style="font-size:13px;line-height:20px;"><span style="background-color:#e9f20f;font-weight:700;">#gerneperdu</span></div>
</td></tr></table>
${quote ? `<div style="margin-top:24px;padding-top:12px;border-top:1px solid #ddd;color:#555;font-size:12px;line-height:1.5;">${asHtmlLines(quote)}</div>` : ""}
</body></html>`;
}
