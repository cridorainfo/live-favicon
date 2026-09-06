import type { PresetRenderer } from "../types";

/** Static amber circle with an exclamation mark — never rely on color alone. */
export const renderWarning: PresetRenderer = ({ ctx, size }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;

  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.5}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", cx, cy + size * 0.02);
};
