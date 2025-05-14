// app/api/auth/magiclink/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMagicLinkEmail } from "@/lib/email";
import validator from "validator";
import Activity from "@/model/Activity"; // Import activity model

// --- In-Memory Stores for Rate Limiting & Cooldown ---
// Note: These maps are per-instance and for demonstration purposes only.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const userCooldownStore: Map<string, number> = new Map();

// --- Configuration for rate limits ---
const RATE_LIMIT_WINDOW = 60 * 1000;    // 60 seconds window.
const MAX_REQUESTS_PER_IP = 5;           // Maximum 5 requests per IP in the window.
const MAX_REQUESTS_PER_EMAIL = 3;        // Maximum 3 requests per email per window.
const COOLDOWN_PERIOD = 60 * 1000;         // 60 seconds cooldown period.

// --- Helper function to enforce rate limits ---
function checkRateLimit(
  key: string,
  store: Map<string, number[]>,
  maxRequests: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  // Keep only timestamps in the valid window.
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (recentTimestamps.length >= maxRequests) {
    store.set(key, recentTimestamps);
    return true;
  }
  recentTimestamps.push(now);
  store.set(key, recentTimestamps);
  return false;
}

// --- Helper function to check cooldown ---
function isInCooldown(email: string): boolean {
  const lastRequestTime = userCooldownStore.get(email);
  if (lastRequestTime && Date.now() - lastRequestTime < COOLDOWN_PERIOD) {
    return true;
  }
  userCooldownStore.set(email, Date.now());
  return false;
}

export async function POST(req: Request) {
  try {
    // Parse request body.
    const { email } = await req.json();

    // Validate email.
    if (!email || !validator.isEmail(email)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 }
      );
    }

    // --- Apply Rate Limiting ---
    // Extract IP from headers. Adjust based on your deployment.
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";

    if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
      return NextResponse.json(
        { success: false, message: "Too many requests from this IP. Please try again later." },
        { status: 429 }
      );
    }

    if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
      return NextResponse.json(
        { success: false, message: "Too many requests for this email. Please try again later." },
        { status: 429 }
      );
    }

    // Check for cooldown for consecutive requests.
    if (isInCooldown(email)) {
      return NextResponse.json(
        { success: false, message: "Please wait a moment before trying again." },
        { status: 429 }
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "No account found with this email" },
        { status: 404 }
      );
    }

    // Banned user check.
    if (user.banned) {
      return NextResponse.json(
        { success: false, message: "User account is banned" },
        { status: 403 }
      );
    }

    // Check if the email is verified.
    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, message: "Email is not verified. Please verify your email before logging in." },
        { status: 403 }
      );
    }

    // Log magic link request activity.
    await Activity.create({
      userId: user._id,
      action: "MagicLinkRequested",
      details: { email }
    });

    // Delete any existing magicLink tokens for this user.
    await Token.deleteMany({ 
      userId: user._id, 
      type: "magicLink" 
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration.

    await Token.create({
      userId: user._id,
      token,
      type: "magicLink",
      expiresAt
    });

    const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/magiclink/verify?token=${token}`;
    await sendMagicLinkEmail(email, verificationUrl);

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email"
    });
    
  } catch (error) {
    console.error("Magic Link Creation Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
