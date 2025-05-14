// app/api/admin/online-users/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();

  // Define a threshold: users active in the last 5 minutes are online
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineUsers = await User.find({ lastSeen: { $gte: fiveMinutesAgo } });
  
  return NextResponse.json({ onlineUsers });
}
