// app/api/auth/verify-otp/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

// --- In-Memory Stores for Rate Limiting & Cooldown ---
// These maps exist per-instance. In production, consider using a distributed store.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const otpCooldownStore: Map<string, number> = new Map();

// --- Configuration for Rate Limiting and Cooldown ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds window.
const MAX_REQUESTS_PER_IP = 5;        // Maximum 5 requests per IP in the window.
const MAX_REQUESTS_PER_EMAIL = 3;     // Maximum 3 requests per email in the window.
const COOLDOWN_PERIOD = 60 * 1000;      // 60 seconds cooldown between successive requests.

// --- Helper Functions ---
function checkRateLimit(
  key: string,
  store: Map<string, number[]>,
  maxRequests: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  // Keep only timestamps within the valid window.
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (recentTimestamps.length >= maxRequests) {
    store.set(key, recentTimestamps);
    return true;
  }
  recentTimestamps.push(now);
  store.set(key, recentTimestamps);
  return false;
}

function isInCooldown(email: string): boolean {
  const lastRequestTime = otpCooldownStore.get(email);
  if (lastRequestTime && (Date.now() - lastRequestTime < COOLDOWN_PERIOD)) {
    return true;
  }
  otpCooldownStore.set(email, Date.now());
  return false;
}

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { message: "Email and OTP are required." },
      { status: 400 }
    );
  }

  // --- Extract Client IP ---
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // --- Apply Rate Limiting ---
  if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
    return NextResponse.json(
      { message: "Too many requests from this IP. Please try again later." },
      { status: 429 }
    );
  }
  if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
    return NextResponse.json(
      { message: "Too many requests for this email. Please try again later." },
      { status: 429 }
    );
  }
  if (isInCooldown(email)) {
    return NextResponse.json(
      { message: "Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  await connectToDatabase();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  // Find the OTP token for the user (type "verification")
  const tokenRecord = await Token.findOne({ userId: user._id, type: "verification" });
  if (!tokenRecord) {
    return NextResponse.json(
      { message: "OTP not found. Please request a new one." },
      { status: 400 }
    );
  }

  if (tokenRecord.expiresAt < new Date()) {
    return NextResponse.json(
      { message: "OTP has expired. Please request a new one." },
      { status: 400 }
    );
  }

  // Compare provided OTP with the stored (hashed) OTP using bcrypt.
  const isValidOTP = await bcrypt.compare(otp, tokenRecord.token);
  if (!isValidOTP) {
    return NextResponse.json(
      { message: "Invalid OTP. Please try again." },
      { status: 400 }
    );
  }

  // Mark user's email as verified and clear verification tokens.
  user.emailVerified = new Date();
  await user.save();
  await Token.deleteMany({ userId: user._id });

  return NextResponse.json(
    { message: "Email verified successfully via OTP." },
    { status: 200 }
  );
}
