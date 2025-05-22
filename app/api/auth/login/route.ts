// app/api/auth/login/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import RefreshToken from "@/model/RefreshToken";
import Session from "@/model/Session";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import Activity from "@/model/Activity";
import crypto from "crypto";

// --- In-Memory Stores for Rate Limiting & Cooldown ---
// These maps exist per instance. In production, consider using a shared store like Redis.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const loginCooldownStore: Map<string, number> = new Map();

// --- Rate Limiting and Cooldown Configuration ---
const RATE_LIMIT_WINDOW = 60 * 1000;      // 60 seconds window.
const MAX_REQUESTS_PER_IP = 10;             // Max 10 login requests per IP per window.
const MAX_REQUESTS_PER_EMAIL = 5;           // Max 5 login requests per email per window.
const COOLDOWN_PERIOD = 60 * 1000;          // 60 seconds cooldown between successive login attempts.

// --- Helper Function to Enforce Rate Limits ---
function checkRateLimit(
  key: string,
  store: Map<string, number[]>,
  maxRequests: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  // Only keep timestamps within the valid window.
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (recentTimestamps.length >= maxRequests) {
    store.set(key, recentTimestamps);
    return true;
  }
  recentTimestamps.push(now);
  store.set(key, recentTimestamps);
  return false;
}

// --- Helper Function to Check Cooldown ---
function isInCooldown(email: string): boolean {
  const lastRequestTime = loginCooldownStore.get(email);
  if (lastRequestTime && (Date.now() - lastRequestTime < COOLDOWN_PERIOD)) {
    return true;
  }
  loginCooldownStore.set(email, Date.now());
  return false;
}
export async function POST(req: Request) {
  const { email, password } = await req.json();

  // Validate input early.
  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 }
    );
  }

  // --- Extract Client IP ---
  const ip = req.headers.get("x-forwarded-for") ||
             req.headers.get("x-real-ip") ||
             "unknown";

  // --- Apply Rate Limiting ---
  if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
    return NextResponse.json(
      { message: "Too many login attempts from this IP. Please try again later." },
      { status: 429 }
    );
  }

  if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
    return NextResponse.json(
      { message: "Too many login attempts for this email. Please try again later." },
      { status: 429 }
    );
  }

  if (isInCooldown(email)) {
    return NextResponse.json(
      { message: "Please wait a moment before trying to login again." },
      { status: 429 }
    );
  }

  try {
    await connectToDatabase();
    
    // IMPORTANT: Select the password field explicitly
    const user = await User.findOne({ email }).select('+password');
    
    // Return proper error if user is not found.
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" }, // Generic message for security
        { status: 401 }
      );
    }

    // Check if user has a password set - provide clearer message
    if (!user.password) {
      return NextResponse.json(
        { 
          message: "This account uses passwordless login",
          suggestedAction: "try_magic_link",
          email: user.email 
        },
        { status: 400 }
      );
    }

    // Validate password.
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { message: "Invalid email or password" }, // Generic message for security
        { status: 401 }
      );
    }

    // Check if email is verified.
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          message: "Email not verified", 
          unverified: true, 
          email: user.email 
        },
        { status: 401 }
      );
    }

    // Check if user is banned.
    if (user.banned) {
      return NextResponse.json(
        { message: "User account is banned" },
        { status: 403 }
      );
    }

    // Log the login activity.
    await Activity.create({
      userId: user._id,
      action: "Login",
      details: { method: "password" }
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is not set");
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Generate a unique sessionId for this login instance.
    const sessionId = crypto.randomBytes(16).toString("hex");

    // Create a new session record.
    await Session.create({
      userId: user._id,
      sessionId,
      lastActivity: new Date()
    });

    // Generate a short-lived access token (expires in 1 hour) that includes the sessionId.
    const accessToken = await new SignJWT({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      onboarded: user.onboarded,
      sessionId,
      role: user.role
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    // Generate a long-lived refresh token (expires in 7 days) that includes sessionId.
    const refreshToken = await new SignJWT({
      userId: user._id.toString(),
      sessionId
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Store the refresh token along with its sessionId in the database.
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      sessionId
    });

    const response = NextResponse.json({
      success: true,
      onboarded: user.onboarded
    });

    response.cookies.set("session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour.
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days.
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}