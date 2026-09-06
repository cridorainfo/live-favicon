import type { PresetRenderer } from "../types";

/** Static gray ring with a diagonal slash. */
export const renderOffline: PresetRenderer = ({ ctx, size }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.4;

  ctx.strokeStyle = "#9CA3AF";
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - radius * 0.7, cy + radius * 0.7);
  ctx.lineTo(cx + radius * 0.7, cy - radius * 0.7);
  ctx.stroke();
};
