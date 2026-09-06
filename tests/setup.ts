/**
 * jsdom doesn't implement 2D canvas rendering. We don't need real pixels for
 * unit tests — we need deterministic, distinguishable output per call so we
 * can assert on state transitions. Stub getContext/toDataURL accordingly.
 */
import { vi } from "vitest";

let callCount = 0;

HTMLCanvasElement.prototype.getContext = vi.fn(() => {
  const noop = () => {};
  return {
    clearRect: noop,
    save: noop,
    restore: noop,
    beginPath: noop,
    arc: noop,
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

HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
  callCount += 1;
  return `data:image/png;base64,FAKE_FRAME_${callCount}`;
}) as unknown as typeof HTMLCanvasElement.prototype.toDataURL;
