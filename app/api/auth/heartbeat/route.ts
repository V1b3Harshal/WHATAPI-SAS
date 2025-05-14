// app/api/auth/heartbeat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/model/Session";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const token = req.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.json({ message: "No session token provided" }, { status: 401 });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const { payload } = await jwtVerify(token, secret);
  const { sessionId } = payload as { sessionId: string };

  if (!sessionId) {
    return NextResponse.json({ message: "Session ID not found in token" }, { status: 400 });
  }

  // Update the session's lastActivity timestamp
  await Session.findOneAndUpdate({ sessionId }, { lastActivity: new Date() });

  return NextResponse.json({ message: "Heartbeat received" });
}
