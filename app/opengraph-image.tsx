import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#fbf7ef",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Arial",
          position: "relative",
        }}
      >
        {/* 🌈 Soft Gradient Blobs */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, rgba(236,72,153,0.35), transparent 60%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -140,
            width: 420,
            height: 420,
            background:
              "radial-gradient(circle, rgba(251,146,60,0.35), transparent 60%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 120,
            left: 300,
            width: 300,
            height: 300,
            background:
              "radial-gradient(circle, rgba(221,242,26,0.25), transparent 60%)",
          }}
        />

        {/* ✦ Doodles */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 180,
            fontSize: 48,
            color: "rgba(236,72,153,0.4)",
          }}
        >
          ✦
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 120,
            left: 200,
            fontSize: 32,
            color: "rgba(0,0,0,0.15)",
          }}
        >
          ✧
        </div>

        {/* 🔝 Header (Logo + Brand) */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <img
            src="https://booking.primakavi.de/logo-primakavi.png"
            width="64"
            height="64"
            style={{
              borderRadius: 16,
              background: "#d9ff00",
              padding: 6,
            }}
          />

          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            primakavi
          </div>
        </div>

        {/* 🧠 Main Title */}
        <div
          style={{
            fontSize: 82,
            fontWeight: 900,
            marginTop: 50,
            color: "#111",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
          }}
        >
          Show Portal
        </div>

        {/* 💬 Subline */}
        <div
          style={{
            fontSize: 30,
            marginTop: 28,
            color: "#444",
            maxWidth: 820,
            lineHeight: 1.4,
          }}
        >
          Shows, Akten, Portale & Vorbereitung an einem Ort.
        </div>

        {/* 🔥 Badge */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            padding: "16px 28px",
            borderRadius: 999,
            background: "linear-gradient(135deg, #f472b6, #fb923c)",
            color: "white",
            fontSize: 20,
            fontWeight: 800,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          }}
        >
          booking.primakavi.de
        </div>
      </div>
    ),
    size
  );
}