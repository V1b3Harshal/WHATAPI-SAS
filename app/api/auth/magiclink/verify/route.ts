// app/api/auth/magiclink/verify/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return invalidTokenResponse();
  }

  try {
    await connectToDatabase();

    const tokenDoc = await Token.findOneAndDelete({
      token,
      type: "magicLink",
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) return invalidTokenResponse();

    const user = await User.findById(tokenDoc.userId);
    if (!user) return userNotFoundResponse();

    user.emailVerified = new Date();
    await user.save();

    const jwtToken = await new SignJWT({ 
      userId: user._id.toString(), 
      email: user.email, 
      onboarded: user.onboarded 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    // Use relative paths instead of absolute URLs
    const redirectPath = user.onboarded ? '/dashboard' : '/onboarding';
    
    // Create a response that will redirect to your frontend
    const response = NextResponse.redirect(new URL(redirectPath, req.url));
    
    // Set the session cookie
    response.cookies.set({
      name: "session",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    );
  }
}

const invalidTokenResponse = () => NextResponse.json(
  { success: false, message: "Invalid or expired token" },
  { status: 401 }
);

const userNotFoundResponse = () => NextResponse.json(
  { success: false, message: "User not found" },
  { status: 404 }
);