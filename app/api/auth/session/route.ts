// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Session from "@/model/Session"; // Import your new session model

// Rename the interface to avoid conflict with jose's JWTPayload
interface CustomJWTPayload {
  userId: string;
  email: string;
  name?: string;
  onboarded: boolean;
  sessionId?: string;
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get cookies from the request.
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
    
    // Verify the token and extract the payload.
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload || typeof payload !== 'object') {
      throw new Error("Invalid token payload");
    }
    
    // Cast the payload to our custom interface.
    const { userId, email, name: tokenName, onboarded, sessionId } =
      (payload as unknown) as CustomJWTPayload;
    
    // Validate required fields.
    if (!userId || !email) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid token payload" },
        { status: 401 }
      );
    }
    
    // Connect to the database to retrieve updated user data.
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Derive the user's name from the token or fallback to the database.
    const finalName = tokenName ?? user.name;
    
    // (Optional) Update the corresponding session's lastActivity if provided.
    if (sessionId) {
      await Session.findOneAndUpdate({ sessionId }, { lastActivity: new Date() });
    }
    
    return NextResponse.json({
      authenticated: true,
      onboarded: onboarded || false,
      userId,
      email,
      name: finalName,
      sessionId, // Returning sessionId can be useful for debugging.
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
