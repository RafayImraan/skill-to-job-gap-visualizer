import { seededProjectAnalysis } from "@/lib/seed-data";

describe("seeded project analysis contract", () => {
  it("keeps recruiter-facing project signals available", () => {
    expect(seededProjectAnalysis.overallScore).toBeGreaterThan(0);
    expect(seededProjectAnalysis.projects.length).toBeGreaterThan(0);
    expect(seededProjectAnalysis.projects[0]).toEqual(
      expect.objectContaining({
        title: expect.any(String),
        recruiterScore: expect.any(Number),
        recommendations: expect.any(Array),
      }),
    );
  });
});
