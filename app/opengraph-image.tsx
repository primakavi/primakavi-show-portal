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
          background: "#0b0b0b",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        {/* Glows */}
        <div
          style={{
            position: "absolute",
            width: 520,
            height: 520,
            left: -120,
            top: -120,
            borderRadius: 999,
            background: "rgba(251,146,60,0.45)",
            filter: "blur(90px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            right: -140,
            top: -80,
            borderRadius: 999,
            background: "rgba(236,72,153,0.42)",
            filter: "blur(90px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            left: 420,
            bottom: -220,
            borderRadius: 999,
            background: "rgba(168,85,247,0.28)",
            filter: "blur(80px)",
          }}
        />

        {/* Doodles */}
        <div
          style={{
            position: "absolute",
            right: 115,
            top: 80,
            fontSize: 64,
            color: "#fb923c",
            opacity: 0.9,
          }}
        >
          ★
        </div>

        <div
          style={{
            position: "absolute",
            right: 95,
            bottom: 112,
            fontSize: 48,
            color: "#ec4899",
            opacity: 0.85,
          }}
        >
          ✦
        </div>

        <div
          style={{
            position: "absolute",
            left: 160,
            bottom: 110,
            fontSize: 42,
            color: "#ddf21a",
            opacity: 0.55,
          }}
        >
          ✧
        </div>

        {/* Content */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "80px",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img
              src={logo}
              width="58"
              height="58"
              style={{
                borderRadius: 14,
              }}
            />

            <div
              style={{
                fontSize: 31,
                fontWeight: 800,
                letterSpacing: "-0.02em",
              }}
            >
              primakavi
            </div>
          </div>

          <div
            style={{
              fontSize: 86,
              fontWeight: 900,
              marginTop: 48,
              letterSpacing: "-0.04em",
              lineHeight: 1,
            }}
          >
            BOOKING CRM.
          </div>

          <div
            style={{
              fontSize: 30,
              marginTop: 30,
              color: "#d4d4d4",
              letterSpacing: "-0.01em",
            }}
          >
            Shows, Akten & Tourplanung an einem Ort.
          </div>

          <div
            style={{
              position: "absolute",
              right: 80,
              bottom: 60,
              padding: "16px 30px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #f472b6, #fb923c)",
              fontSize: 20,
              fontWeight: 800,
              boxShadow: "0 18px 45px rgba(0,0,0,0.45)",
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