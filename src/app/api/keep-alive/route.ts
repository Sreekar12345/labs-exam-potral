import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    // Run a simple lightweight raw SQL query to verify connection and keep it alive
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "success",
      message: "Database ping succeeded. Connection is warm.",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Keep-alive database ping failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to the database.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
