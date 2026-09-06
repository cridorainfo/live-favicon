import type { PresetRenderer } from "../types";

/** A rotating-arc spinner, the classic "loading" affordance, in a given color. */
export function makeSpinner(color: string): PresetRenderer {
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

export const renderLoading = makeSpinner("#3B82F6");
export const renderProcessing = makeSpinner("#8B5CF6");
export const renderSyncing = makeSpinner("#14B8A6");
export const renderPayment = makeSpinner("#EAB308");
