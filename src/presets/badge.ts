/** Draws a small numeric badge over whatever is already on the canvas. */
export function drawBadge(ctx: CanvasRenderingContext2D, size: number, count: number): void {
  if (!count || count <= 0) return;

  const label = count > 99 ? "99+" : String(Math.round(count));
  const r = size * (label.length > 2 ? 0.32 : 0.26);
  const cx = size - r * 0.95;
  const cy = r * 0.95;

  ctx.fillStyle = "#EF4444";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${r * 1.15}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, cx, cy + r * 0.05);
}
