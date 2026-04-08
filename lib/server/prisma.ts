import { PrismaClient } from "@prisma/client";
import { hasDatabaseUrl } from "@/lib/server/env";

declare global {
  var __skillGapPrisma__: PrismaClient | undefined;
}

export function getPrismaClient() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  if (!global.__skillGapPrisma__) {
    global.__skillGapPrisma__ = new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return global.__skillGapPrisma__;
}
