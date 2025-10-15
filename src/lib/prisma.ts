import { PrismaClient } from "@prisma/client";

// En producción, podemos usar una única instancia de PrismaClient
// En desarrollo, usamos una instancia global para evitar múltiples instancias
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
