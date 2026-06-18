import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const students = await db.student.findMany();
    const assessments = await db.assessment.findMany();
    const questions = await db.question.findMany();
    const reports = await db.reportLog.findMany();

    const formattedStudents = students.map((s) => ({
      id: s.id,
      roll: s.roll,
      name: s.name,
      email: s.email,
      dept: s.dept,
      year: s.year,
      section: s.section,
      status: s.status,
      lastLogin: s.lastLogin || "",
    }));

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      language: q.language,
      difficulty: q.difficulty,
      marks: q.marks,
      topic: q.topic,
      lastUpdated: q.lastUpdated,
      status: q.status,
      timesUsed: q.timesUsed,
      avgScore: q.avgScore,
      successRate: q.successRate,
      avgTime: q.avgTime,
      createdBy: q.createdBy,
      createdDate: q.createdDate,
      version: q.version,
      tags: JSON.parse(q.tags || "[]"),
      description: q.description || undefined,
      estimatedTime: q.estimatedTime || undefined,
      allowedLanguages: JSON.parse(q.allowedLanguages || "[]"),
      codeTemplates: q.codeTemplates ? JSON.parse(q.codeTemplates) : undefined,
      sampleInput: q.sampleInput || undefined,
      sampleOutput: q.sampleOutput || undefined,
      inputFormat: q.inputFormat || undefined,
      outputFormat: q.outputFormat || undefined,
      constraints: q.constraints || undefined,
      explanation: q.explanation || undefined,
    }));

    const examSessions = await db.examSession.findMany();
    return NextResponse.json({
      status: "success",
      students: formattedStudents,
      assessments,
      questions: formattedQuestions,
      reports,
      examSessions,
    });
  } catch (error: any) {
    console.error("Sync GET error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to load database data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { students, assessments, questions, reports, examSessions, type } = await request.json();

    if (type === "students" && students) {
      const studentRolls = students.map((s: any) => s.roll);
      await db.student.deleteMany({
        where: {
          roll: {
            notIn: studentRolls,
          },
        },
      });
      for (const s of students) {
        await db.student.upsert({
          where: { roll: s.roll },
          update: {
            name: s.name,
            email: s.email,
            dept: s.dept,
            year: s.year,
            section: s.section,
            status: s.status,
            lastLogin: s.lastLogin,
          },
          create: {
            id: s.id,
            roll: s.roll,
            name: s.name,
            email: s.email,
            mobile: s.mobile || "9876543210",
            collegeName: s.collegeName || "PSG College of Technology",
            dept: s.dept,
            year: s.year,
            section: s.section,
            status: s.status,
            password: s.password || "pbkdf2_hashed_or_mock_password", // Fallback for loaded students
            lastLogin: s.lastLogin,
          },
        });
      }
    }

    if (type === "assessments" && assessments) {
      // Clean delete removed assessments or just upsert all
      const assessmentIds = assessments.map((a: any) => a.id);
      await db.assessment.deleteMany({
        where: {
          id: {
            notIn: assessmentIds,
          },
        },
      });
      for (const a of assessments) {
        await db.assessment.upsert({
          where: { id: a.id },
          update: {
            name: a.name,
            subject: a.subject,
            duration: a.duration,
            questionsCount: a.questionsCount,
            assignedCount: a.assignedCount,
            status: a.status,
            createdDate: a.createdDate,
            date: a.date,
          },
          create: {
            id: a.id,
            name: a.name,
            subject: a.subject,
            duration: a.duration,
            questionsCount: a.questionsCount,
            assignedCount: a.assignedCount,
            status: a.status,
            createdDate: a.createdDate,
            date: a.date,
          },
        });
      }
    }

    if (type === "questions" && questions) {
      const questionIds = questions.map((q: any) => q.id);
      await db.question.deleteMany({
        where: {
          id: {
            notIn: questionIds,
          },
        },
      });
      for (const q of questions) {
        await db.question.upsert({
          where: { id: q.id },
          update: {
            title: q.title,
            language: q.language,
            difficulty: q.difficulty,
            marks: q.marks,
            topic: q.topic,
            lastUpdated: q.lastUpdated,
            status: q.status,
            timesUsed: q.timesUsed,
            avgScore: q.avgScore,
            successRate: q.successRate,
            avgTime: q.avgTime,
            createdBy: q.createdBy,
            createdDate: q.createdDate,
            version: q.version,
            tags: JSON.stringify(q.tags || []),
            description: q.description || null,
            estimatedTime: q.estimatedTime || null,
            allowedLanguages: JSON.stringify(q.allowedLanguages || []),
            codeTemplates: q.codeTemplates ? JSON.stringify(q.codeTemplates) : null,
            sampleInput: q.sampleInput || null,
            sampleOutput: q.sampleOutput || null,
            inputFormat: q.inputFormat || null,
            outputFormat: q.outputFormat || null,
            constraints: q.constraints || null,
            explanation: q.explanation || null,
          },
          create: {
            id: q.id,
            title: q.title,
            language: q.language,
            difficulty: q.difficulty,
            marks: q.marks,
            topic: q.topic,
            lastUpdated: q.lastUpdated,
            status: q.status,
            timesUsed: q.timesUsed,
            avgScore: q.avgScore,
            successRate: q.successRate,
            avgTime: q.avgTime,
            createdBy: q.createdBy,
            createdDate: q.createdDate,
            version: q.version,
            tags: JSON.stringify(q.tags || []),
            description: q.description || null,
            estimatedTime: q.estimatedTime || null,
            allowedLanguages: JSON.stringify(q.allowedLanguages || []),
            codeTemplates: q.codeTemplates ? JSON.stringify(q.codeTemplates) : null,
            sampleInput: q.sampleInput || null,
            sampleOutput: q.sampleOutput || null,
            inputFormat: q.inputFormat || null,
            outputFormat: q.outputFormat || null,
            constraints: q.constraints || null,
            explanation: q.explanation || null,
          },
        });
      }
    }

    if (type === "reports" && reports) {
      const reportIds = reports.map((r: any) => r.id);
      await db.reportLog.deleteMany({
        where: {
          id: {
            notIn: reportIds,
          },
        },
      });
      for (const r of reports) {
        await db.reportLog.upsert({
          where: { id: r.id },
          update: {
            name: r.name,
            category: r.category,
            generatedDate: r.generatedDate,
            generatedBy: r.generatedBy,
            exportType: r.exportType,
            downloadCount: r.downloadCount,
          },
          create: {
            id: r.id,
            name: r.name,
            category: r.category,
            generatedDate: r.generatedDate,
            generatedBy: r.generatedBy,
            exportType: r.exportType,
            downloadCount: r.downloadCount,
          },
        });
      }
    }

    if (type === "examSessions" && examSessions) {
      const sessionIds = examSessions.map((es: any) => es.id);
      await db.examSession.deleteMany({
        where: {
          id: {
            notIn: sessionIds,
          },
        },
      });
      for (const es of examSessions) {
        await db.examSession.upsert({
          where: { id: es.id },
          update: {
            studentRoll: es.studentRoll,
            assessmentId: es.assessmentId,
            questionOrder: es.questionOrder,
            startedAt: es.startedAt,
            submittedAt: es.submittedAt,
          },
          create: {
            id: es.id,
            studentRoll: es.studentRoll,
            assessmentId: es.assessmentId,
            questionOrder: es.questionOrder,
            startedAt: es.startedAt,
            submittedAt: es.submittedAt,
          },
        });
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Sync POST error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to save data" },
      { status: 500 }
    );
  }
}
