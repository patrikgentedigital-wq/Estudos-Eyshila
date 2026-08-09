import { describe, expect, it } from "vitest";
import { normalizeTtsRate, SUPPORTED_TTS_RATES } from "../src/hooks/useTTS";

describe("TTS speed policy", () => {
  it("exposes only the supported playback speeds", () => {
    expect(SUPPORTED_TTS_RATES).toEqual([1, 1.25, 1.5, 2]);
  });

  it("normalizes the legacy 0.75x value to 1x", () => {
    expect(normalizeTtsRate(0.75)).toBe(1);
  });

  it("keeps invalid values safe", () => {
    expect(normalizeTtsRate(Number.NaN)).toBe(1);
    expect(normalizeTtsRate(2.4)).toBe(2);
  });
});

