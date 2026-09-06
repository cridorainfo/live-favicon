import { describe, expect, it } from "vitest";
import { renderAlarm } from "../src/presets/alarm";
import { renderCelebration } from "../src/presets/celebration";
import { renderQueue } from "../src/presets/queue";
import { renderPayment } from "../src/presets/spinner";
import type { RenderContext } from "../src/types";

function recordingContext() {
  const arcRadii: number[] = [];
  const ctx = {
    beginPath: () => {},
    arc: (_x: number, _y: number, radius: number) => {
      arcRadii.push(radius);
    },
    fill: () => {},
    stroke: () => {},
    moveTo: () => {},
    lineTo: () => {},
    set fillStyle(_: unknown) {},
    set strokeStyle(_: unknown) {},
    set lineWidth(_: unknown) {},
    set lineCap(_: unknown) {},
    set globalAlpha(_: unknown) {},
  } as unknown as CanvasRenderingContext2D;
  return { ctx, arcRadii };
}

const T_VALUES = [0, 0.001, 0.5, 1, 100, 100000, -0.001, -1];

describe.each([
  ["renderAlarm", renderAlarm],
  ["renderCelebration", renderCelebration],
  ["renderQueue", renderQueue],
  ["renderPayment", renderPayment],
])("%s", (_name, render) => {
  it("never throws and never passes a negative radius to arc(), across a wide range of t", () => {
    for (const t of T_VALUES) {
      const { ctx, arcRadii } = recordingContext();
      expect(() => render({ ctx, size: 64, t } as RenderContext)).not.toThrow();
      for (const r of arcRadii) expect(r).toBeGreaterThanOrEqual(0);
    }
  });

  it("draws at least one arc at a typical t", () => {
    const { ctx, arcRadii } = recordingContext();
    render({ ctx, size: 64, t: 0.3 } as RenderContext);
    expect(arcRadii.length).toBeGreaterThan(0);
  });
});

describe("celebration", () => {
  it("is multi-color: not every fillStyle set during a frame is the same value", () => {
    const seen: unknown[] = [];
    const ctx = {
      beginPath: () => {},
      arc: () => {},
      fill: () => {},
      set fillStyle(v: unknown) {
        seen.push(v);
      },
      set globalAlpha(_: unknown) {},
    } as unknown as CanvasRenderingContext2D;
    renderCelebration({ ctx, size: 64, t: 0.3 } as RenderContext);
    expect(new Set(seen).size).toBeGreaterThan(1);
  });
});

describe("queue", () => {
  it("draws exactly three dots per frame", () => {
    const { ctx, arcRadii } = recordingContext();
    renderQueue({ ctx, size: 64, t: 0.4 } as RenderContext);
    expect(arcRadii.length).toBe(3);
  });
});
