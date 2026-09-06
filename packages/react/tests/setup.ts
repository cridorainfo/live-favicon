/**
 * jsdom doesn't implement 2D canvas rendering; live-favicon renders via
 * Canvas internally. Stub just enough of the API for it to run without
 * throwing — the hooks here don't assert on pixel output, only on DOM/state
 * side effects (favicon link presence, hook return values).
 */
import { vi } from "vitest";

HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  const noop = () => {};
  return {
    clearRect: noop,
    save: noop,
    restore: noop,
    beginPath: noop,
    closePath: noop,
    arc: noop,
    arcTo: noop,
    fill: noop,
    stroke: noop,
    moveTo: noop,
    lineTo: noop,
    fillText: noop,
    set fillStyle(_: unknown) {},
    set strokeStyle(_: unknown) {},
    set lineWidth(_: unknown) {},
    set lineCap(_: unknown) {},
    set lineJoin(_: unknown) {},
    set globalAlpha(_: unknown) {},
    set font(_: unknown) {},
    set textAlign(_: unknown) {},
    set textBaseline(_: unknown) {},
  } as unknown as CanvasRenderingContext2D;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

let callCount = 0;
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
  callCount += 1;
  return `data:image/png;base64,FAKE_FRAME_${callCount}`;
}) as unknown as typeof HTMLCanvasElement.prototype.toDataURL;
