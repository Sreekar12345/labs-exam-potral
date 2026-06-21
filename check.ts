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
  const users = await prisma.faculty.findMany();
  console.log("FACULTY USERS IN DB:", JSON.stringify(users, null, 2));
  await prisma.$disconnect();
  await pool.end();
}

main().catch(console.error);
