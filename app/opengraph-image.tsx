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
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 78% 22%, rgba(236,72,153,0.34), transparent 38%), radial-gradient(circle at 22% 18%, rgba(251,146,60,0.24), transparent 34%), radial-gradient(circle at 50% 95%, rgba(168,85,247,0.24), transparent 42%), #09090b",
          color: "white",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 54,
            borderRadius: 44,
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025))",
            border: "1px solid rgba(255,255,255,0.11)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 92,
            top: 78,
            fontSize: 42,
            color: "rgba(236,72,153,0.75)",
          }}
        >
          ✦
        </div>

        <div
          style={{
            position: "absolute",
            left: 155,
            bottom: 92,
            fontSize: 34,
            color: "rgba(221,242,26,0.52)",
          }}
        >
          ✧
        </div>

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
            <div
              style={{
                width: 66,
                height: 66,
                borderRadius: 18,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 13,
                  backgroundImage:
                    "url(https://booking.primakavi.de/logo-primakavi.png)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  fontSize: 31,
                  fontWeight: 800,
                  letterSpacing: "-0.03em",
                  color: "rgba(255,255,255,0.94)",
                }}
              >
                primakavi
              </div>

              <div
                style={{
                  marginTop: 4,
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.42)",
                }}
              >
                Show Portal
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: 88,
              fontWeight: 900,
              marginTop: 56,
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
              color: "rgba(255,255,255,0.68)",
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
              background: "linear-gradient(135deg, #f472b6, #fb923c)",
              color: "white",
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