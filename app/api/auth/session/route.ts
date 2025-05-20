// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Session from "@/model/Session";

// Updated interface with role
interface CustomJWTPayload {
  userId: string;
  email: string;
  name?: string;
  onboarded: boolean;
  sessionId?: string;
  role?: string; // Add role here
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get cookies from the request
    const cookieStore = (await cookies()) as unknown as {
      getAll: () => Array<{ name: string; value: string }>;
      get: (name: string) => { value: string } | undefined;
    };

    const token = cookieStore.get('session')?.value;
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
    
    // Cast the payload
    const { userId, email, name: tokenName, onboarded, sessionId, role: tokenRole } =
      (payload as unknown) as CustomJWTPayload;
    
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

    // Get values with fallbacks
    const finalName = tokenName ?? user.name;
    const finalRole = tokenRole ?? user.role ?? 'user'; // Fallback to 'user' if not specified
    
    // Update session activity if sessionId exists
    if (sessionId) {
      await Session.findOneAndUpdate({ sessionId }, { lastActivity: new Date() });
    }
    
    return NextResponse.json({
      authenticated: true,
      onboarded: onboarded || false,
      userId,
      email,
      name: finalName,
      role: finalRole, // Include role in response
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