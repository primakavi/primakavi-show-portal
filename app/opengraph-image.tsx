import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

async function getLogoDataUrl() {
  const res = await fetch("https://booking.primakavi.de/logo-primakavi.png", {
    cache: "no-store",
  });

  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return `data:image/png;base64,${base64}`;
}

export default async function Image() {
  const logo = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 78% 22%, rgba(236,72,153,0.32), transparent 38%), radial-gradient(circle at 22% 18%, rgba(251,146,60,0.22), transparent 34%), radial-gradient(circle at 50% 95%, rgba(168,85,247,0.22), transparent 42%), #09090b",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        {/* subtle inner panel */}
        <div
          style={{
            position: "absolute",
            inset: 54,
            borderRadius: 42,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.10)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "92px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={logo}
              width="54"
              height="54"
              style={{
                borderRadius: 14,
              }}
            />

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              primakavi
            </div>
          </div>

          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              marginTop: 54,
              letterSpacing: "-0.06em",
              lineHeight: 0.95,
              color: "#ffffff",
            }}
          >
            Booking CRM.
          </div>

          <div
            style={{
              fontSize: 30,
              marginTop: 32,
              color: "rgba(255,255,255,0.66)",
              letterSpacing: "-0.02em",
              maxWidth: 780,
              lineHeight: 1.35,
            }}
          >
            Shows, Akten und Tourplanung an einem Ort.
          </div>

          <div
            style={{
              position: "absolute",
              right: 92,
              bottom: 74,
              padding: "15px 28px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.16)",
              color: "rgba(255,255,255,0.86)",
              fontSize: 19,
              fontWeight: 800,
              letterSpacing: "-0.01em",
            }}
          >
            booking.primakavi.de
          </div>
        </div>
      </div>
    ),
    size
  );
}