// app/api/admin/ban-user/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import RefreshToken from "@/model/RefreshToken";
import Session from "@/model/Session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  await connectToDatabase();
  const { userId } = await req.json();

  // Mark the user as banned
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { banned: true },
    { new: true }
  );

  if (!updatedUser) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  // Remove all refresh tokens associated with the user
  await RefreshToken.deleteMany({ userId });
  
  // Remove all active session records for the user
  await Session.deleteMany({ userId });

  return NextResponse.json({
    message: "User has been banned and all sessions and tokens have been removed",
    user: updatedUser
  });
}
