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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#0b0b0b",
          color: "white",
          fontFamily: "Arial",
          position: "relative",
        }}
      >
        {/* 🌈 Glow Gradient (wie Dashboard) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 30%, rgba(251,146,60,0.35), transparent 35%), radial-gradient(circle at 80% 40%, rgba(236,72,153,0.35), transparent 40%), radial-gradient(circle at 50% 80%, rgba(168,85,247,0.25), transparent 40%)",
          }}
        />

        {/* ✦ Doodles (wie UI) */}
        <div
          style={{
            position: "absolute",
            right: 120,
            top: 80,
            fontSize: 60,
            color: "#fb923c",
          }}
        >
          ★
        </div>

        <div
          style={{
            position: "absolute",
            right: 80,
            bottom: 80,
            fontSize: 48,
            color: "#ec4899",
          }}
        >
          👑
        </div>

        {/* 🔝 Header (Logo + Brand) */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            zIndex: 2,
          }}
        >
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
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-0.02em",
            }}
          >
            primakavi
          </div>
        </div>

        {/* 🧠 Headline */}
        <div
          style={{
            fontSize: 84,
            fontWeight: 900,
            marginTop: 50,
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            zIndex: 2,
          }}
        >
          BOOKING CRM
        </div>

        {/* 💬 Subline */}
        <div
          style={{
            fontSize: 30,
            marginTop: 28,
            color: "#d4d4d4",
            maxWidth: 820,
            lineHeight: 1.4,
            zIndex: 2,
          }}
        >
          Shows, Akten & Tourplanung an einem Ort.
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
            fontSize: 20,
            fontWeight: 800,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            zIndex: 2,
          }}
        >
          booking.primakavi.de
        </div>
      </div>
    ),
    size
  );
}