import type { PresetRenderer } from "../types";

const QUEUE_COLOR = "#0EA5E9";
const CYCLE = 1.2;

/**
 * Three dots pulsing in sequence, left to right — "your position is
 * moving." Distinct from thinking's circular orbit; pairs naturally with
 * badge() when the actual queue position is known.
 */
export const renderQueue: PresetRenderer = ({ ctx, size, t }) => {
  const cy = size / 2;
  const spacing = size * 0.22;
  const startX = size / 2 - spacing;
  const dotRadius = size * 0.08;
  const phase = (t % CYCLE) / CYCLE;

  for (let i = 0; i < 3; i++) {
    const dotPhase = (phase - i * 0.2 + 1) % 1;
    const scale = 0.6 + 0.4 * Math.max(0, Math.sin(dotPhase * Math.PI));
    const x = startX + i * spacing;

    ctx.globalAlpha = 0.5 + scale * 0.5;
    ctx.fillStyle = QUEUE_COLOR;
    ctx.beginPath();
    ctx.arc(x, cy, dotRadius * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};
