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
          background: "#101014",
          color: "white",
          display: "flex",
          padding: "70px",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-120px",
            top: "-120px",
            width: "420px",
            height: "420px",
            borderRadius: "999px",
            background: "#ff4fa3",
            filter: "blur(80px)",
            opacity: 0.55,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "360px",
            bottom: "-160px",
            width: "480px",
            height: "480px",
            borderRadius: "999px",
            background: "#ff9f43",
            filter: "blur(90px)",
            opacity: 0.35,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "100px",
            bottom: "90px",
            fontSize: "90px",
            opacity: 0.75,
          }}
        >
          ♕
        </div>

        <div
          style={{
            position: "absolute",
            right: "260px",
            top: "130px",
            fontSize: "64px",
            opacity: 0.8,
          }}
        >
          ✨
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "22px",
              }}
            >
              <img
                src="https://booking.primakavi.de/primakavi-logo.png"
                width="74"
                height="74"
                style={{ borderRadius: "18px" }}
              />

              <div style={{ fontSize: "42px", fontWeight: 900 }}>
                primakavi
              </div>
            </div>

            <div
              style={{
                marginTop: "70px",
                fontSize: "76px",
                fontWeight: 900,
                letterSpacing: "-3px",
                lineHeight: 1,
                maxWidth: "760px",
              }}
            >
              Booking CRM
            </div>

            <div
              style={{
                marginTop: "28px",
                fontSize: "34px",
                color: "rgba(255,255,255,0.72)",
                maxWidth: "760px",
                lineHeight: 1.25,
              }}
            >
              Shows, Akten, Portale & Vorbereitung an einem Ort.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "18px",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            <span
              style={{
                background: "rgba(255,255,255,0.12)",
                padding: "14px 22px",
                borderRadius: "999px",
              }}
            >
              Show Portal
            </span>

            <span
              style={{
                background: "rgba(255,255,255,0.12)",
                padding: "14px 22px",
                borderRadius: "999px",
              }}
            >
              Artist Booking
            </span>
          </div>
        </div>
      </div>
    ),
    size
  );
}