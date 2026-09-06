import type { PresetRenderer } from "../types";

/** A dot with a ring that pulses outward and fades, looping every 1.2s. */
export const renderNotification: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const cycle = 1.2;
  const phase = (t % cycle) / cycle;
  const ringRadius = size * 0.18 + phase * size * 0.24;

  ctx.strokeStyle = `rgba(59, 130, 246, ${1 - phase})`;
  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#3B82F6";
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
  ctx.fill();
};
