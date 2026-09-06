import { describe, expect, it } from "vitest";
import { renderSuccess } from "../src/presets/success";
import { renderError } from "../src/presets/error";
import type { RenderContext } from "../src/types";

function recordingContext() {
  const calls: string[] = [];
  const arcRadii: number[] = [];
  const record = (name: string) => () => {
    calls.push(name);
  };
  const ctx = {
    beginPath: record("beginPath"),
    arc: (_x: number, _y: number, radius: number) => {
      calls.push("arc");
      arcRadii.push(radius);
    },
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
  return { ctx, calls, arcRadii };
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

  // Regression: rAF's own frame timestamp isn't guaranteed to be >= a
  // performance.now() taken just before scheduling it, so the scheduler can
  // occasionally hand a preset a slightly negative `t`. Before the fix, an
  // unclamped `pop` here went negative too, which made `radius * eased`
  // negative — passing a negative radius to ctx.arc() throws a real
  // IndexSizeError in the browser (caught live on the site's demo section).
  it.each([-0.001, -0.05, -1, -Infinity])("renderSuccess never passes a negative radius to arc() (t=%s)", (t) => {
    const { ctx, arcRadii } = recordingContext();
    expect(() => renderSuccess({ ctx, size: 64, t } as RenderContext)).not.toThrow();
    for (const r of arcRadii) expect(r).toBeGreaterThanOrEqual(0);
  });

  it.each([-0.001, -0.05, -1, -Infinity])("renderError never passes a negative radius to arc() (t=%s)", (t) => {
    const { ctx, arcRadii } = recordingContext();
    expect(() => renderError({ ctx, size: 64, t } as RenderContext)).not.toThrow();
    for (const r of arcRadii) expect(r).toBeGreaterThanOrEqual(0);
  });
});
