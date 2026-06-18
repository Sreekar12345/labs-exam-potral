import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, generateToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      employeeId,
      email,
      mobile,
      collegeName,
      department,
      designation,
      password,
    } = body;

    if (
      !fullName ||
      !employeeId ||
      !email ||
      !mobile ||
      !collegeName ||
      !department ||
      !designation ||
      !password
    ) {
      return NextResponse.json(
        { status: "error", message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingEmployee = await db.faculty.findUnique({
      where: { employeeId: employeeId.toUpperCase() },
    });

    if (existingEmployee) {
      return NextResponse.json(
        {
          status: "error",
          message: "Faculty with this Employee ID already exists",
        },
        { status: 400 }
      );
    }

    const existingEmail = await db.faculty.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          status: "error",
          message: "Faculty with this email already exists",
        },
        { status: 400 }
      );
    }

    const passwordHash = hashPassword(password);

    const faculty = await db.faculty.create({
      data: {
        fullName,
        employeeId: employeeId.toUpperCase(),
        email: email.toLowerCase(),
        mobile,
        collegeName,
        department,
        designation,
        password: passwordHash,
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
        fullName: faculty.fullName,
        employeeId: faculty.employeeId,
        email: faculty.email,
        department: faculty.department,
        designation: faculty.designation,
        collegeName: faculty.collegeName,
      },
    });
  } catch (error: any) {
    console.error("Faculty registration error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
