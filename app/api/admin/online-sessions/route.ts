// app/api/admin/online-sessions/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/model/Session";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  // Define a threshold: sessions active in the last 5 minutes are online
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const sessions = await Session.find({ lastActivity: { $gte: fiveMinutesAgo } });
  
  // Aggregate sessions by userId, using the most recent activity time
  const aggregated: Record<string, string> = {};
  sessions.forEach((session) => {
    const uid = session.userId.toString();
    const current = aggregated[uid] ? new Date(aggregated[uid]) : null;
    if (!current || session.lastActivity > current) {
      aggregated[uid] = session.lastActivity.toISOString();
    }
  });

  return NextResponse.json({ onlineSessions: aggregated });
}
