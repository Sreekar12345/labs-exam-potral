import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comparePassword, generateToken } from "@/lib/auth-utils";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { status: "error", message: "Email and password are required" },
        { status: 400 }
      );
    }

    let admin = null;
    let attempts = 3;
    while (attempts > 0) {
      try {
        admin = await db.admin.findUnique({
          where: { email: email.toLowerCase() },
        });
        break;
      } catch (dbError: any) {
        attempts--;
        if (attempts === 0) throw dbError;
        console.warn(`Database connection failed on admin login, retrying in 1.5s... (Attempts left: ${attempts})`);
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    }

    if (!admin) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isPasswordValid = comparePassword(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { status: "error", message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: "Admin",
    });

    return NextResponse.json({
      status: "success",
      token,
      profile: {
        email: admin.email,
        role: "Admin",
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
