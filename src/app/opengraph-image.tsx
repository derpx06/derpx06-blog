import { OG } from "@/resources/og-palette";
import { ImageResponse } from "next/og";

export const alt = "Derpx06 — AI, agents, research, and engineering";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 78px",
        color: OG.ink,
        backgroundColor: OG.background,
        backgroundImage: OG.glow,
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
            backgroundColor: OG.accent,
            color: OG.onAccent,
            fontSize: 34,
            fontWeight: 800,
          }}
        >
          D6
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700 }}>derpx06.online</div>
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
            color: OG.body,
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
          color: OG.muted,
        }}
      >
        <span>Manas Khairnar</span>
        <span style={{ color: OG.accent }}>Share magic.</span>
      </div>
    </div>,
    size,
  );
}
