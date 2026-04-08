import { generateFallbackResumeRewrite } from "@/lib/server/resume-intelligence";

describe("resume intelligence fallback", () => {
  it("builds rewrite suggestions from resume text and target role", () => {
    const result = generateFallbackResumeRewrite({
      resumeText:
        "Responsible for a React dashboard used by 120 students. Worked on REST API integration and improved CI/CD pipelines.",
      targetRole: "Frontend Engineer",
      jobDescription: "Looking for a frontend engineer with React, TypeScript, testing, and accessibility experience.",
    });

    expect(result.mode).toBe("fallback");
    expect(result.targetRole).toBe("Frontend Engineer");
    expect(result.matchScore).toBeGreaterThan(40);
    expect(result.improvedBullets[0]).toContain("Led");
    expect(result.recommendedKeywords).toEqual(expect.arrayContaining(["React", "TypeScript", "Testing"]));
    expect(result.strengths.length).toBeGreaterThan(0);
  });
});
