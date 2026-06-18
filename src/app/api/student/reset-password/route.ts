import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { id, roll, newPassword } = await request.json();

    if (!id && !roll) {
      return NextResponse.json(
        { status: "error", message: "Student ID or Roll Number is required" },
        { status: 400 }
      );
    }

    const passwordToHash = newPassword || "password";
    const passwordHash = hashPassword(passwordToHash);

    let student;
    if (id) {
      student = await db.student.update({
        where: { id },
        data: { password: passwordHash },
      });
    } else {
      student = await db.student.update({
        where: { roll: roll.toUpperCase() },
        data: { password: passwordHash },
      });
    }

    return NextResponse.json({
      status: "success",
      message: `Password reset successfully for student ${student.name} (${student.roll})`,
    });
  } catch (error: any) {
    console.error("Student password reset error:", error);
    return NextResponse.json(
      { status: "error", message: "Failed to reset password in the database" },
      { status: 500 }
    );
  }
}
