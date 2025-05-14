// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import RefreshToken from "@/model/RefreshToken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get("refreshToken")?.value;
  if (!refreshTokenCookie) {
    return NextResponse.json({ message: "No refresh token provided" }, { status: 401 });
  }
  const oldRefreshToken = refreshTokenCookie;

  try {
    await connectToDatabase();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Verify the provided refresh token
    const { payload } = await jwtVerify(oldRefreshToken, secret);
    // Extract userId and sessionId from the token payload
    const { userId, sessionId } = payload as { userId: string; sessionId: string };

    // Check if this refresh token exists in the database (i.e. has not been revoked)
    const tokenDoc = await RefreshToken.findOne({ token: oldRefreshToken, sessionId });
    if (!tokenDoc) {
      return NextResponse.json({ message: "Refresh token invalid" }, { status: 401 });
    }

    // Remove only the old refresh token for this session
    await RefreshToken.deleteOne({ token: oldRefreshToken, sessionId });

    // Generate a new access token (expires in 1 hour)
    const newAccessToken = await new SignJWT({
      userId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    // Generate a new refresh token (expires in 7 days) and include the same sessionId
    const newRefreshToken = await new SignJWT({
      userId,
      sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Store the new refresh token in the database
    await RefreshToken.create({ userId, token: newRefreshToken, sessionId });

    const response = NextResponse.json({ success: true });
    response.cookies.set("session", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
      domain: undefined,
    });
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      domain: undefined,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ message: "Invalid or expired refresh token" }, { status: 401 });
  }
}
