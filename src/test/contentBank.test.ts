import { afterEach, describe, expect, it } from "vitest";
import {
  INGREDIENTS,
  getIngredientBank,
  setExtraIngredients,
  validateIngredients,
  type Ingredient,
} from "@/supabase/_shared/composer";

afterEach(() => setExtraIngredients([]));

const extra: Ingredient = {
  id: "p:test-deep-11m",
  kind: "practice",
  label: "Test Deep Sit",
  summary: "A test ingredient with enough instruction text to clear the bar of sixty characters.",
  body: "A test ingredient with enough instruction text to clear the bar of sixty characters.",
  practice: "witness",
  depth: "deep",
  stepKind: "witness",
  defaultMinutes: 11,
  params: { durationSeconds: 660 },
  paths: ["raja"],
  dimensions: ["awareness"],
  loopFamilies: ["MEN", "NAR"],
  minJourneyDay: 21,
};

describe("content bank", () => {
  it("the shipped bank passes the content bar", () => {
    const issues = validateIngredients(INGREDIENTS);
    expect(issues, JSON.stringify(issues.slice(0, 5))).toEqual([]);
  });

  it("merges unique extras", () => {
    setExtraIngredients([extra]);
    expect(getIngredientBank()).toHaveLength(INGREDIENTS.length + 1);
    expect(getIngredientBank().some((i) => i.id === extra.id)).toBe(true);
  });

  it("ignores duplicates of the in-file bank", () => {
    setExtraIngredients([{ ...extra, id: INGREDIENTS[0].id }]);
    expect(getIngredientBank()).toHaveLength(INGREDIENTS.length);
  });

  it("dedupes within the incoming list", () => {
    setExtraIngredients([extra, { ...extra }]);
    expect(getIngredientBank()).toHaveLength(INGREDIENTS.length + 1);
  });

  it("rejects an ingredient without loop families or targets", () => {
    const bad = { ...extra, id: "p:bad", loopFamilies: [], loopTargets: [] };
    const issues = validateIngredients([bad]);
    expect(issues.some((i) => i.field === "loopFamilies")).toBe(true);
  });

  it("rejects a thin instruction", () => {
    const bad = { ...extra, id: "p:thin", body: "short", summary: "short" };
    const issues = validateIngredients([bad]);
    expect(issues.some((i) => i.field === "summary")).toBe(true);
  });

  it("rejects an overlong label", () => {
    const bad = { ...extra, id: "p:long", label: "x".repeat(41) };
    const issues = validateIngredients([bad]);
    expect(issues.some((i) => i.field === "label")).toBe(true);
  });
});
