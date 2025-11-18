import { PrismaClient } from "../generated/prisma";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Créer une instance Prisma standard sans extension Accelerate
// L'extension Accelerate nécessite une configuration spéciale et peut empêcher les insertions
const prisma =
  globalForPrisma.prisma || new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
