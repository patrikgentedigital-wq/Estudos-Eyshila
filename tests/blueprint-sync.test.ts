import { describe, it, expect } from "vitest";
import { ENARE_BLUEPRINT } from "../api/index.js";
import { ENARE_2026_BLUEPRINT } from "../src/utils/studyEngine.js";

describe("Blueprint Synchronization Tests", () => {
  it("should ensure backend ENARE_BLUEPRINT matches frontend ENARE_2026_BLUEPRINT", () => {
    expect(ENARE_BLUEPRINT.id).toBe(ENARE_2026_BLUEPRINT.id);
    expect(ENARE_BLUEPRINT.questionCount).toBe(ENARE_2026_BLUEPRINT.questionCount);
    expect(ENARE_BLUEPRINT.durationMinutes).toBe(ENARE_2026_BLUEPRINT.durationMinutes);
    expect(ENARE_BLUEPRINT.optionsPerQuestion).toBe(ENARE_2026_BLUEPRINT.optionsPerQuestion);
    expect(ENARE_BLUEPRINT.generalQuestionCount).toBe(ENARE_2026_BLUEPRINT.generalQuestionCount);
    expect(ENARE_BLUEPRINT.specificQuestionCount).toBe(ENARE_2026_BLUEPRINT.specificQuestionCount);
    expect(ENARE_BLUEPRINT.minimumPassingPercentage).toBe(ENARE_2026_BLUEPRINT.minimumPassingPercentage);
  });
});
