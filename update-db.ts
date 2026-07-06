import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

const isLocal = process.env.DATABASE_URL?.includes("localhost") || process.env.DATABASE_URL?.includes("127.0.0.1");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const facultyResult = await prisma.faculty.updateMany({
    where: {
      NOT: {
        collegeName: "Gouthami Institute of Technology and Management for Women"
      }
    },
    data: {
      collegeName: "Gouthami Institute of Technology and Management for Women"
    }
  });
  console.log(`UPDATED ${facultyResult.count} FACULTY RECORDS IN DATABASE.`);

  const studentResult = await prisma.student.updateMany({
    where: {
      NOT: {
        collegeName: "Gouthami Institute of Technology and Management for Women"
      }
    },
    data: {
      collegeName: "Gouthami Institute of Technology and Management for Women"
    }
  });
  console.log(`UPDATED ${studentResult.count} STUDENT RECORDS IN DATABASE.`);

  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
