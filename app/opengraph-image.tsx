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
          background: "#111",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "Arial",
        }}
      >
        <div style={{ fontSize: 42, fontWeight: 800 }}>
          primakavi
        </div>

        <div style={{ fontSize: 72, fontWeight: 900, marginTop: 40 }}>
          Booking CRM
        </div>

        <div style={{ fontSize: 28, opacity: 0.7, marginTop: 20 }}>
          Shows, Akten & Tourplanung an einem Ort
        </div>
      </div>
    ),
    size
  );
}