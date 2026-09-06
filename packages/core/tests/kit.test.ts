import { describe, expect, it } from "vitest";
import { spinner, pulse, iconBadge } from "../src/presets/kit";
import type { RenderContext } from "../src/types";

function recordingContext() {
  const calls: string[] = [];
  const fillTexts: string[] = [];
  const strokeStyles: string[] = [];
  const record = (name: string) => () => {
    calls.push(name);
  };
  const ctx = {
    beginPath: record("beginPath"),
    arc: record("arc"),
    fill: record("fill"),
    stroke: record("stroke"),
    fillText: (text: string) => {
      calls.push("fillText");
      fillTexts.push(text);
    },
    set fillStyle(_: unknown) {},
    set strokeStyle(v: string) {
      strokeStyles.push(v);
    },
    set lineWidth(_: unknown) {},
    set lineCap(_: unknown) {},
    set font(_: unknown) {},
    set textAlign(_: unknown) {},
    set textBaseline(_: unknown) {},
  } as unknown as CanvasRenderingContext2D;
  return { ctx, calls, fillTexts, strokeStyles };
}

describe("preset kit", () => {
  it("spinner() draws a background ring plus a colored arc, in the given color", () => {
    const { ctx, calls, strokeStyles } = recordingContext();
    const render = spinner("#FF6B57");
    render({ ctx, size: 64, t: 0.5 } as RenderContext);
    expect(calls.filter((c) => c === "arc").length).toBe(2);
    expect(strokeStyles).toContain("#FF6B57");
  });

  it("spinner() never throws across a range of t, including 0 and large values", () => {
    const { ctx } = recordingContext();
    const render = spinner("#000000");
    for (const t of [0, 0.001, 1, 100, 100000]) {
      expect(() => render({ ctx, size: 64, t } as RenderContext)).not.toThrow();
    }
  });

  it("pulse() draws a ring and a dot", () => {
    const { ctx, calls } = recordingContext();
    const render = pulse("#3B82F6");
    render({ ctx, size: 64, t: 0.3 } as RenderContext);
    expect(calls.filter((c) => c === "arc").length).toBe(2);
    expect(calls).toContain("fill");
    expect(calls).toContain("stroke");
  });

  it("pulse() never throws across a range of t", () => {
    const { ctx } = recordingContext();
    const render = pulse("#3B82F6");
    for (const t of [0, 0.001, 1, 100]) {
      expect(() => render({ ctx, size: 64, t } as RenderContext)).not.toThrow();
    }
  });

  it("iconBadge() draws a filled circle and the given glyph", () => {
    const { ctx, calls, fillTexts } = recordingContext();
    const render = iconBadge("#DC2626", "!");
    render({ ctx, size: 64, t: 0 } as RenderContext);
    expect(calls.filter((c) => c === "arc").length).toBe(1);
    expect(fillTexts).toEqual(["!"]);
  });

  it("iconBadge() supports multi-character glyphs (e.g. initials)", () => {
    const { ctx, fillTexts } = recordingContext();
    const render = iconBadge("#111827", "AI");
    render({ ctx, size: 64, t: 0 } as RenderContext);
    expect(fillTexts).toEqual(["AI"]);
  });

  it("iconBadge() respects a custom textColor", () => {
    const { ctx, calls } = recordingContext();
    const render = iconBadge("#111827", "A", { textColor: "#F59E0B" });
    expect(() => render({ ctx, size: 64, t: 0 } as RenderContext)).not.toThrow();
    expect(calls).toContain("fillText");
  });
});
