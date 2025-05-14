// app/api/admin/users/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ users });
}
