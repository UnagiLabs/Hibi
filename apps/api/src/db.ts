import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function checkDatabase(): Promise<"ok" | "error"> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return "ok";
  } catch {
    return "error";
  }
}
