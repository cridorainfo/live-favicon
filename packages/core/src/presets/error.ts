import type { PresetRenderer } from "../types";

const POP_DURATION = 0.3;

/** A circle pops in, then an X draws once the pop settles. Holds afterward. */
export const renderError: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.42;
  // See the matching comment in success.ts: clamp to [0, 1] so rAF
  // timestamp jitter can never produce a negative radius here.
  const pop = Math.max(0, Math.min(1, t / POP_DURATION));
  const eased = 1 - Math.pow(1 - pop, 3);

  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.arc(cx, cy, radius * eased, 0, Math.PI * 2);
  ctx.fill();

  if (pop >= 1) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = size * 0.11;
    ctx.lineCap = "round";
    const d = radius * 0.35;
    ctx.beginPath();
    ctx.moveTo(cx - d, cy - d);
    ctx.lineTo(cx + d, cy + d);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + d, cy - d);
    ctx.lineTo(cx - d, cy + d);
    ctx.stroke();
  }
};
