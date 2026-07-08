import { PrismaClient } from "@prisma/client";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const pgConnectionString = "postgresql://neondb_owner:npg_YW8JDrKTBIS4@ep-soft-dawn-atxyxsnd-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function main() {
  const mongoUrl = process.env.DATABASE_URL;
  if (!mongoUrl || mongoUrl.includes("<db_password>")) {
    console.error("ERROR: Please replace <db_password> with your actual MongoDB password in the local .env file first!");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  const pgPool = new Pool({
    connectionString: pgConnectionString,
    ssl: { rejectUnauthorized: false }
  });

  console.log("Connecting to MongoDB...");
  const prisma = new PrismaClient();

  try {
    // 1. Migrate Admin
    console.log("Migrating Admin table...");
    const adminsRes = await pgPool.query('SELECT * FROM "Admin"');
    console.log(`Found ${adminsRes.rows.length} Admins in PostgreSQL.`);
    for (const row of adminsRes.rows) {
      await prisma.admin.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 2. Migrate Faculty
    console.log("Migrating Faculty table...");
    const facultyRes = await pgPool.query('SELECT * FROM "Faculty"');
    console.log(`Found ${facultyRes.rows.length} Faculty in PostgreSQL.`);
    for (const row of facultyRes.rows) {
      await prisma.faculty.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 3. Migrate Student
    console.log("Migrating Student table...");
    const studentRes = await pgPool.query('SELECT * FROM "Student"');
    console.log(`Found ${studentRes.rows.length} Students in PostgreSQL.`);
    for (const row of studentRes.rows) {
      await prisma.student.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 4. Migrate Assessment
    console.log("Migrating Assessment table...");
    const assessmentRes = await pgPool.query('SELECT * FROM "Assessment"');
    console.log(`Found ${assessmentRes.rows.length} Assessments in PostgreSQL.`);
    for (const row of assessmentRes.rows) {
      await prisma.assessment.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 5. Migrate Question
    console.log("Migrating Question table...");
    const questionRes = await pgPool.query('SELECT * FROM "Question"');
    console.log(`Found ${questionRes.rows.length} Questions in PostgreSQL.`);
    for (const row of questionRes.rows) {
      await prisma.question.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 6. Migrate ReportLog
    console.log("Migrating ReportLog table...");
    const reportRes = await pgPool.query('SELECT * FROM "ReportLog"');
    console.log(`Found ${reportRes.rows.length} ReportLogs in PostgreSQL.`);
    for (const row of reportRes.rows) {
      await prisma.reportLog.upsert({
        where: { id: row.id },
        update: row,
        create: row
      });
    }

    // 7. Migrate ExamSession
    console.log("Migrating ExamSession table...");
    const sessionRes = await pgPool.query('SELECT * FROM "ExamSession"');
    console.log(`Found ${sessionRes.rows.length} ExamSessions in PostgreSQL.`);
    for (const row of sessionRes.rows) {
      await prisma.examSession.upsert({
        where: { id: row.id },
        update: {
          studentRoll: row.studentRoll,
          assessmentId: row.assessmentId,
          questionOrder: row.questionOrder,
          startedAt: row.startedAt,
          submittedAt: row.submittedAt,
          codeSubmissions: row.codeSubmissions
        },
        create: row
      });
    }

    console.log("Migration completed successfully!");

  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    await pgPool.end();
    await prisma.$disconnect();
  }
}

main();
