import type { PresetRenderer } from "../types";

/** Three particles orbiting a shared center, fading as they pass behind. */
export const renderThinking: PresetRenderer = ({ ctx, size, t }) => {
  const cx = size / 2;
  const cy = size / 2;
  const orbitRadius = size * 0.28;
  const dotRadius = size * 0.09;
  const dots = 3;

  for (let i = 0; i < dots; i++) {
    const phaseOffset = (i * Math.PI * 2) / dots;
    const angle = t * 2.4 + phaseOffset;
    const x = cx + Math.cos(angle) * orbitRadius;
    const y = cy + Math.sin(angle) * orbitRadius;
    const glow = (Math.sin(angle) + 1) / 2; // brighter in "front"

    ctx.globalAlpha = 0.35 + glow * 0.65;
    ctx.fillStyle = "#6366F1";
    ctx.beginPath();
    ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
};
