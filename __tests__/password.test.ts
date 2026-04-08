import { hashPassword, verifyPassword } from "@/lib/server/password";

describe("password helpers", () => {
  it(
    "hashes and verifies a valid password",
    async () => {
    const hash = await hashPassword("demo12345");

    await expect(verifyPassword("demo12345", hash)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
    },
    15000,
  );

  it("fails safely when hash format is invalid", async () => {
    await expect(verifyPassword("demo12345", "invalid")).resolves.toBe(false);
    await expect(verifyPassword("demo12345", null)).resolves.toBe(false);
  });
});
