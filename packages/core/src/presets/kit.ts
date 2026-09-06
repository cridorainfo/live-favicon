import type { PresetRenderer } from "../types";

/**
 * Building blocks for custom states (see favicon.define()). Each returns a
 * ready-to-use PresetRenderer — no canvas code required for the common
 * cases. Compose these, or write a raw PresetRenderer by hand for anything
 * more specific (it's just `({ ctx, size, t }) => { ...draw... }`).
 */

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

/** A rotating-arc spinner in any color — the same shape as loading/processing/syncing. */
export function spinner(color: string): PresetRenderer {
  return ({ ctx, size, t }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.36;

    ctx.lineWidth = size * 0.14;
    ctx.lineCap = "round";

    ctx.strokeStyle = "rgba(0,0,0,0.12)";
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();

    const start = t * 3.2;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, start, start + Math.PI * 1.1);
    ctx.stroke();
  };
}

/** A dot with an expanding, fading ring, in any color — the notification/mention shape. */
export function pulse(color: string): PresetRenderer {
  const [r, g, b] = hexToRgb(color);
  return ({ ctx, size, t }) => {
    const cx = size / 2;
    const cy = size / 2;
    const cycle = 1.2;
    const phase = (t % cycle) / cycle;
    const ringRadius = size * 0.18 + phase * size * 0.24;

    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${1 - phase})`;
    ctx.lineWidth = size * 0.05;
    ctx.beginPath();
    ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
  };
}

/**
 * A solid-color circle with a centered glyph (a letter, a symbol, an emoji)
 * — for a brand mark, an initial, or any static status that needs to read
 * clearly at 16px without relying on color alone (see accessibility.md).
 */
export function iconBadge(color: string, glyph: string, options: { textColor?: string } = {}): PresetRenderer {
  const textColor = options.textColor ?? "#ffffff";
  const fontScale = glyph.length <= 1 ? 0.5 : 0.34;

  return ({ ctx, size }) => {
    const cx = size / 2;
    const cy = size / 2;
    const radius = size * 0.42;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.font = `bold ${size * fontScale}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(glyph, cx, cy + size * 0.02);
  };
}
