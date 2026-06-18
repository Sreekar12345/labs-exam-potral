import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  keepAliveInterval: any;
};

let db: PrismaClient;

if (typeof window === "undefined") {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 30000, // Wait up to 30 seconds for connections (Neon cold starts)
      max: 20, // Limit connection pool size
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    });
  }
  const adapter = new PrismaPg(globalForPrisma.pool);
  db = globalForPrisma.prisma ?? new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

  // Periodically ping the database to keep it warm (every 4 minutes)
  if (!globalForPrisma.keepAliveInterval) {
    globalForPrisma.keepAliveInterval = setInterval(async () => {
      try {
        await db.$queryRaw`SELECT 1`;
      } catch (e) {
        console.error("Database keep-alive ping failed:", e);
      }
    }, 4 * 60 * 1000);

    if (globalForPrisma.keepAliveInterval.unref) {
      globalForPrisma.keepAliveInterval.unref();
    }
  }
} else {
  db = null as any;
}

export { db };
