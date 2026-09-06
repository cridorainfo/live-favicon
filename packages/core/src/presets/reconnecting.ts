import type { PresetRenderer } from "../types";

/** A broken, flickering ring — conveys instability, distinct from the smooth spinners. */
export const renderReconnecting: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.36;
  const segments = 6;
  const gap = 0.35;

  ctx.lineWidth = size * 0.12;
  ctx.lineCap = "butt";

  for (let i = 0; i < segments; i++) {
    const segStart = (i / segments) * Math.PI * 2 + t * 2.6;
    const segLen = ((Math.PI * 2) / segments) * (1 - gap);
    const flicker = 0.5 + 0.5 * Math.sin(t * 6 + i);

    ctx.globalAlpha = 0.4 + flicker * 0.6;
    ctx.strokeStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, segStart, segStart + segLen);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
};
