import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const result = await prisma.faculty.updateMany({
    where: {
      collegeName: "PSG College of Technology"
    },
    data: {
      collegeName: "GITAMW Tech Node"
    }
  });
  console.log(`UPDATED ${result.count} FACULTY RECORDS IN DATABASE.`);
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
