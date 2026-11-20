import { describe, expect, it } from "vitest";
import { assessCrisis } from "@/supabase/_shared/crisis";

describe("assessCrisis", () => {
  it("flags stated intent as acute", () => {
    const r = assessCrisis("I want to die");
    expect(r.severity).toBe("acute");
    expect(r.isCrisis).toBe(true);
  });

  it("flags Hinglish stated intent as acute", () => {
    expect(assessCrisis("main khudkushi karna chahta hoon").isCrisis).toBe(true);
    expect(assessCrisis("ab marna chahta hoon").isCrisis).toBe(true);
  });

  it("flags passive ideation as elevated but not a short-circuit", () => {
    const r = assessCrisis("I feel like everyone is better off dead without me");
    expect(r.severity).toBe("elevated");
    expect(r.isCrisis).toBe(false);
    expect(r.directive.length).toBeGreaterThan(0);
  });

  it("does not flag ordinary venting", () => {
    expect(assessCrisis("today was exhausting and I am angry").severity).toBe("none");
    expect(assessCrisis("").severity).toBe("none");
    expect(assessCrisis(null).severity).toBe("none");
  });

  it("does not flag a positive word containing a crisis stem", () => {
    expect(assessCrisis("badhiya din tha").severity).toBe("none");
  });

  it("returns matched evidence for reviewers", () => {
    expect(assessCrisis("I keep thinking about suicide").matched.length).toBeGreaterThan(0);
  });
});
