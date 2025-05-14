// app/api/auth/magiclink/verify/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(req: Request) {
  // Parse URL and extract token from query parameters.
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return invalidTokenResponse();
  }

  try {
    await connectToDatabase();

    // Find and delete the magic link token if it exists and is not expired.
    const tokenDoc = await Token.findOneAndDelete({
      token,
      type: "magicLink",
      expiresAt: { $gt: new Date() }
    });

    if (!tokenDoc) return invalidTokenResponse();

    // Retrieve the user associated with this token.
    const user = await User.findById(tokenDoc.userId);
    if (!user) return userNotFoundResponse();

    // Mark the user's email as verified.
    user.emailVerified = new Date();
    await user.save();

    // Generate a short-lived JWT token.
    const jwtToken = await new SignJWT({ 
      userId: user._id.toString(), 
      email: user.email, 
      onboarded: user.onboarded 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET!));

    // Ensure that the base URL is defined in your environment.
    if (!process.env.NEXTAUTH_URL) {
      throw new Error("Missing NEXTAUTH_URL environment variable");
    }
    const baseUrl = process.env.NEXTAUTH_URL;
    
    // Build the redirect URL based on whether the user has been onboarded.
    // Adjust the paths based on your application's routing structure.
    const redirectPath = user.onboarded ? '/login/dashboard' : '/onboarding';
    const redirectUrl = new URL(`${baseUrl}${redirectPath}`);
    redirectUrl.searchParams.set('success', 'true');

    // Create a redirect response and set the session cookie.
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set({
      name: "session",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 3600
    });

    // Allow credentials for CORS if needed.
    response.headers.set('Access-Control-Allow-Credentials', 'true');

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
