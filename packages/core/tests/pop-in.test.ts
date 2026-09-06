import { describe, expect, it } from "vitest";
import { renderSuccess } from "../src/presets/success";
import { renderError } from "../src/presets/error";
import type { RenderContext } from "../src/types";

function recordingContext() {
  const calls: string[] = [];
  const record = (name: string) => () => {
    calls.push(name);
  };
  const ctx = {
    beginPath: record("beginPath"),
    arc: record("arc"),
    fill: record("fill"),
    stroke: record("stroke"),
    moveTo: record("moveTo"),
    lineTo: record("lineTo"),
    set fillStyle(_: unknown) {},
    set strokeStyle(_: unknown) {},
    set lineWidth(_: unknown) {},
    set lineCap(_: unknown) {},
    set lineJoin(_: unknown) {},
  } as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

function drawCallCount(calls: string[]): number {
  return calls.filter((c) => c === "moveTo").length;
}

// success/error only stroke their checkmark/X once the pop-in circle has
// fully expanded (t >= its pop duration). This is what index.ts's settle
// logic depends on: it force-paints at t=1 specifically so this mark is
// guaranteed visible, even when the scheduler never gets another tick in
// time (see the comment in index.ts's state() for why that matters).
describe("success/error pop-in gating", () => {
  it("renderSuccess draws no checkmark at t=0", () => {
    const { ctx, calls } = recordingContext();
    renderSuccess({ ctx, size: 64, t: 0 } as RenderContext);
    expect(drawCallCount(calls)).toBe(0);
  });

  it("renderSuccess draws the checkmark once settled (t=1)", () => {
    const { ctx, calls } = recordingContext();
    renderSuccess({ ctx, size: 64, t: 1 } as RenderContext);
    expect(drawCallCount(calls)).toBeGreaterThan(0);
  });

  it("renderError draws no X at t=0", () => {
    const { ctx, calls } = recordingContext();
    renderError({ ctx, size: 64, t: 0 } as RenderContext);
    expect(drawCallCount(calls)).toBe(0);
  });

  it("renderError draws the X once settled (t=1)", () => {
    const { ctx, calls } = recordingContext();
    renderError({ ctx, size: 64, t: 1 } as RenderContext);
    expect(drawCallCount(calls)).toBeGreaterThan(0);
  });
});
