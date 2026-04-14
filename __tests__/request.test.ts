import {
  enforceRateLimit,
  getRetryAfterSeconds,
  validateEmail,
  validateGithubUsername,
  validateOptionalUrl,
  validatePassword,
} from "@/lib/server/request";

describe("request guards", () => {
  it("validates normalized email and password input", () => {
    expect(validateEmail(" Test@Example.com ")).toBe("test@example.com");
    expect(validatePassword("password123")).toBe("password123");
  });

  it("rejects invalid URLs and GitHub usernames", () => {
    expect(() => validateOptionalUrl("ftp://example.com", "Profile URL")).toThrow("Profile URL must be a valid URL.");
    expect(() => validateGithubUsername("bad__name")).toThrow("GitHub username is invalid.");
  });

  it("reports retry-after seconds once a rate limit is exceeded", () => {
    const key = `test-limit-${Date.now()}`;

    enforceRateLimit(key, 1, 1000);

    try {
      enforceRateLimit(key, 1, 1000);
      throw new Error("Expected rate limit to throw.");
    } catch (error) {
      expect(getRetryAfterSeconds(error)).toBeGreaterThanOrEqual(1);
    }
  });
});
