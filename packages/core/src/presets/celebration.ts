import type { PresetRenderer } from "../types";

const CONFETTI_COLORS = ["#F59E0B", "#3B82F6", "#22C55E", "#EC4899", "#8B5CF6"];
const CYCLE = 1.4;

/**
 * A confetti burst radiating outward and fading, looping — for "something
 * good and special happened" (a milestone, an offer, an achievement), as
 * distinct from success's plain task-completion checkmark. The only
 * built-in preset that's deliberately multi-color.
 */
export const renderCelebration: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const phase = (t % CYCLE) / CYCLE;

  for (let i = 0; i < CONFETTI_COLORS.length; i++) {
    const angle = (i / CONFETTI_COLORS.length) * Math.PI * 2;
    const distance = phase * size * 0.36;
    const x = cx + Math.cos(angle) * distance;
    const y = cy + Math.sin(angle) * distance;
    const dotRadius = Math.max(0, size * 0.06 * (1 - phase * 0.4));

    ctx.globalAlpha = Math.max(0, 1 - phase);
    ctx.fillStyle = CONFETTI_COLORS[i]!;
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // A small core that stays crisp through the loop, so it never reads as empty.
  ctx.fillStyle = "#F59E0B";
  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, size * 0.1 * (1 - phase * 0.5)), 0, Math.PI * 2);
  ctx.fill();
};
