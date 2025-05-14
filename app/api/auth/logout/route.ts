// app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import Activity from "@/model/Activity";
import RefreshToken from "@/model/RefreshToken";
import Session from "@/model/Session";
import { connectToDatabase } from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  
  const token = req.cookies.get("session")?.value;
  const refreshTokenCookie = req.cookies.get("refreshToken")?.value;

  if (token && process.env.JWT_SECRET && refreshTokenCookie) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      // Verify session token
      const { payload } = await jwtVerify(token, secret);
      const { userId, sessionId } = payload as { userId: string; sessionId: string };

      if (userId && sessionId) {
        // Log logout activity
        await Activity.create({
          userId,
          action: "Logout",
          details: {}
        });

        // Delete the refresh token record for this session
        await RefreshToken.deleteOne({ token: refreshTokenCookie, sessionId });

        // Delete the session record for this session
        await Session.deleteOne({ sessionId });
      }
    } catch (err) {
      console.error("Error logging logout activity:", err);
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully" });
  // Clear both session and refreshToken cookies
  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
