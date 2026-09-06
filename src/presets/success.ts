import type { PresetRenderer } from "../types";

const POP_DURATION = 0.35;

/** A circle pops in, then a checkmark draws once the pop settles. Holds afterward. */
export const renderSuccess: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  const pop = Math.min(1, t / POP_DURATION);
  const eased = 1 - Math.pow(1 - pop, 3);

  ctx.fillStyle = "#22C55E";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * eased, 0, Math.PI * 2);
  ctx.fill();

  if (pop >= 1) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = size * 0.11;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(cx - radius * 0.45, cy + radius * 0.02);
    ctx.lineTo(cx - radius * 0.12, cy + radius * 0.35);
    ctx.lineTo(cx + radius * 0.5, cy - radius * 0.35);
    ctx.stroke();
  }
};
