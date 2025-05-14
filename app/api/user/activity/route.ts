// app/api/user/activity/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import Activity from "@/model/Activity";

interface JWTPayload {
  userId: string;
}

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }
    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    // Convert payload to unknown then to JWTPayload
    const { userId } = payload as unknown as JWTPayload;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    await connectToDatabase();

    // Retrieve all activities for the user, sorted by newest first
    const activities = await Activity.find({ userId }).sort({ createdAt: -1 });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ message: "Error fetching activity logs" }, { status: 500 });
  }
}
