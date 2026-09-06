import type { PresetRenderer } from "../types";

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A chat bubble with three dots, gently breathing — for new-message states. */
export const renderMessage: PresetRenderer = ({ ctx, size, t }) => {
  const pulse = 1 + Math.sin(t * 3) * 0.04;
  const w = size * 0.62 * pulse;
  const h = size * 0.44 * pulse;
  const x = size / 2 - w / 2;
  const y = size * 0.26;
  const r = size * 0.1;

  ctx.fillStyle = "#3B82F6";
  roundedRect(ctx, x, y, w, h, r);
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.26, y + h);
  ctx.lineTo(x + w * 0.16, y + h + size * 0.12);
  ctx.lineTo(x + w * 0.42, y + h);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  const dotY = y + h / 2;
  for (const f of [0.3, 0.5, 0.7]) {
    ctx.beginPath();
    ctx.arc(x + w * f, dotY, size * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }
};
