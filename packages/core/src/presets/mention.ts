import type { PresetRenderer } from "../types";

/** An "@" badge with an expanding, fading ring — visually distinct from notification(). */
export const renderMention: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const cycle = 1.1;
  const phase = (t % cycle) / cycle;

  ctx.strokeStyle = `rgba(249, 115, 22, ${1 - phase})`;
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.2 + phase * size * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#F97316";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.32, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${size * 0.32}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("@", cx, cy + size * 0.02);
};
