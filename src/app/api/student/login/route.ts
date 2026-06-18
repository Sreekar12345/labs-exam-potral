import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { rollNumber, password } = await request.json();

    if (!rollNumber || !password) {
      return NextResponse.json(
        { status: "error", message: "Roll number and password are required" },
        { status: 400 }
      );
    }

    let student = null;
    let attempts = 3;
    while (attempts > 0) {
      try {
        student = await db.student.findUnique({
          where: { roll: rollNumber.toUpperCase() },
        });
        break;
      } catch (dbError: any) {
        attempts--;
        if (attempts === 0) throw dbError;
        console.warn(`Database connection failed on student login, retrying in 1.5s... (Attempts left: ${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (!student) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = comparePassword(password, student.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    const updatedStudent = await db.student.update({
      where: { id: student.id },
      data: {
        lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
      },
    });

    const token = generateToken({
      id: student.id,
      roll: student.roll,
      role: "Student",
    });

    return NextResponse.json({
      status: "success",
      token,
      profile: {
        roll: updatedStudent.roll,
        name: updatedStudent.name,
        email: updatedStudent.email,
        dept: updatedStudent.dept === "CSE" ? "Computer Science" : updatedStudent.dept,
        year: updatedStudent.year,
        section: updatedStudent.section,
        ip: "192.168.12.104", // Mock IP as in the frontend
      },
    });
  } catch (error: any) {
    console.error("Student login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
