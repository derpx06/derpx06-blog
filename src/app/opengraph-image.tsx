import { ImageResponse } from "next/og";

export const alt = "Derpx06 — AI, agents, research, and engineering";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 78px",
          color: "#f8fafc",
          background:
            "radial-gradient(circle at 18% 14%, rgba(250, 204, 21, 0.22), transparent 34%), radial-gradient(circle at 85% 78%, rgba(99, 102, 241, 0.2), transparent 38%), #070707",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#facc15",
              color: "#09090b",
              fontSize: 34,
              fontWeight: 800,
            }}
          >
            D6
          </div>
          <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>
            derpx06.online
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              maxWidth: 980,
              fontSize: 72,
              lineHeight: 1.05,
              letterSpacing: "-3px",
              fontWeight: 800,
            }}
          >
            Building, learning, and explaining technology.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#b8bcc6",
            }}
          >
            AI agents · Research-paper explainers · Engineering tutorials
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 24,
            color: "#d4d4d8",
          }}
        >
          <span>Manas Khairnar</span>
          <span style={{ color: "#facc15" }}>Share magic.</span>
        </div>
      </div>
    ),
    size,
  );
}
