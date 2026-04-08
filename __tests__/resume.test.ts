import { analyzeResumeText } from "@/lib/server/resume";

describe("resume analysis", () => {
  it("extracts ATS insights from resume text", () => {
    const result = analyzeResumeText(
      "Built a React and TypeScript dashboard for 120 users. Implemented REST API integration and improved CI/CD.",
    );

    expect(result.atsScore).toBeGreaterThanOrEqual(55);
    expect(result.suggestedSkills).toEqual(expect.arrayContaining(["React", "TypeScript", "REST API", "CI/CD"]));
    expect(result.missingKeywords).toContain("SQL");
    expect(result.findings).toHaveLength(3);
  });

  it("flags weak phrases when present", () => {
    const result = analyzeResumeText("Responsible for frontend work and helped with deployment.");

    expect(result.weakPhrases).toEqual(expect.arrayContaining(["responsible for", "helped with"]));
    expect(result.findings[1]?.severity).toBe("amber");
  });
});
