// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Session from "@/model/Session";

interface CustomJWTPayload {
  userId: string;
  email: string;
  name?: string;
  onboarded: boolean;
  sessionId?: string;
  role?: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get cookies from the request
    const cookieStore = cookies();
    const token = (await cookieStore).get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: "No session token" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    
    // Verify the token
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload || typeof payload !== 'object') {
      throw new Error("Invalid token payload");
    }
    
    // Extract and validate payload
    const { userId, email, name: tokenName, onboarded, sessionId, role: tokenRole } =
      payload as unknown as CustomJWTPayload;

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid token payload" },
        { status: 401 }
      );
    }
    
    // Connect to database
    await connectToDatabase();
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Ensure role consistency
    if (tokenRole && tokenRole !== user.role) {
      return NextResponse.json(
        { authenticated: false, error: "Role mismatch - please reauthenticate" },
        { status: 401 }
      );
    }

    // Determine final values
    const finalName = tokenName ?? user.name;
    const finalRole = tokenRole ?? user.role;
    
    // Update session activity if sessionId exists
    if (sessionId) {
      await Session.findOneAndUpdate(
        { sessionId }, 
        { lastActivity: new Date() }
      );
    }
    
    return NextResponse.json({
      authenticated: true,
      onboarded: onboarded || false,
      userId,
      email,
      name: finalName,
      role: finalRole,
      sessionId,
    });
    
  } catch (err) {
    console.error("Session verification error:", err);
    return NextResponse.json(
      { 
        authenticated: false,
        error: err instanceof Error ? err.message : "Invalid session token"
      },
      { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}