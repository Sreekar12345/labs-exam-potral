import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { emailOrId, password } = await request.json();

    if (!emailOrId || !password) {
      return NextResponse.json(
        { status: "error", message: "Faculty ID/Email and password are required" },
        { status: 400 }
      );
    }

    let faculty = null;
    let attempts = 3;
    while (attempts > 0) {
      try {
        faculty = await db.faculty.findFirst({
          where: {
            OR: [
              { employeeId: emailOrId.toUpperCase() },
              { email: emailOrId.toLowerCase() },
            ],
          },
        });
        break;
      } catch (dbError: any) {
        attempts--;
        if (attempts === 0) throw dbError;
        console.warn(`Database connection failed on faculty login, retrying in 1.5s... (Attempts left: ${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (!faculty) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = comparePassword(password, faculty.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login
    const updatedFaculty = await db.faculty.update({
      where: { id: faculty.id },
      data: {
        lastLogin: new Date().toISOString().slice(0, 16).replace("T", " "),
      },
    });

    const token = generateToken({
      id: faculty.id,
      employeeId: faculty.employeeId,
      role: "Faculty",
    });

    return NextResponse.json({
      status: "success",
      token,
      profile: {
        fullName: updatedFaculty.fullName,
        employeeId: updatedFaculty.employeeId,
        email: updatedFaculty.email,
        department: updatedFaculty.department,
        designation: updatedFaculty.designation,
        collegeName: updatedFaculty.collegeName,
      },
    });
  } catch (error: any) {
    console.error("Faculty login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
