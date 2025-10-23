import { PrismaClient } from "@prisma/client";

// Forzar la carga de DATABASE_URL desde process.env si no está definida
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL no está definida, intentando cargar desde variables de entorno del sistema');
}

// En producción, podemos usar una única instancia de PrismaClient
// En desarrollo, usamos una instancia global para evitar múltiples instancias
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://root:mysql.botilyx2024@10.10.102.2:30002/botilyx_db"
    }
  }
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
