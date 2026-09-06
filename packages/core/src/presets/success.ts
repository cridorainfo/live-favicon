import type { PresetRenderer } from "../types";

const POP_DURATION = 0.35;

/** A circle pops in, then a checkmark draws once the pop settles. Holds afterward. */
export const renderSuccess: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  // Clamp to [0, 1]: t can arrive slightly negative from rAF timestamp
  // jitter (the frame timestamp isn't always >= a performance.now() taken
  // just before scheduling it), and an unclamped negative pop here would
  // make `eased` negative, which makes `radius * eased` a negative radius —
  // an invalid argument to ctx.arc() that throws IndexSizeError.
  const pop = Math.max(0, Math.min(1, t / POP_DURATION));
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
