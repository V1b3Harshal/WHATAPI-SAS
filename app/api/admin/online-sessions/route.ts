//app\api\admin\online-sessions\route.ts
import { connectToDatabase } from "@/lib/mongodb";
import Session from "@/model/Session";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  // Include user data in the session query
  const sessions = await Session.find({ 
    lastActivity: { $gte: fiveMinutesAgo } 
  }).populate('userId', 'id name email'); // Populate user data

  const aggregated: Record<string, string> = {};
  
  sessions.forEach((session) => {
    if (!session.userId) return; // Skip if no user
    
    const uid = session.userId._id.toString();
    const current = aggregated[uid] ? new Date(aggregated[uid]) : null;
    
    if (!current || session.lastActivity > current) {
      aggregated[uid] = session.lastActivity.toISOString();
    }
  });

  return NextResponse.json({ 
    onlineSessions: aggregated,
    // Include session user data for debugging
    sessionUsers: sessions.map(s => ({
      userId: s.userId?._id?.toString(),
      userData: s.userId
    }))
  });
}