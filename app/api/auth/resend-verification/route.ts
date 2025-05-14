// app/api/auth/resend-verification/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

// --- In-Memory Stores for Rate Limiting & Cooldown ---
// These are per-instance. In production, consider using Redis or another shared datastore.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const userCooldownStore: Map<string, number> = new Map();

// --- Configuration for rate limits ---
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds window.
const MAX_REQUESTS_PER_IP = 5;        // Maximum 5 requests per IP in the window.
const MAX_REQUESTS_PER_EMAIL = 3;     // Maximum 3 requests per email per window.
const COOLDOWN_PERIOD = 60 * 1000;      // 60 seconds cooldown between successive requests.

// --- Helper function to enforce rate limits ---
function checkRateLimit(
  key: string,
  store: Map<string, number[]>,
  maxRequests: number
): boolean {
  const now = Date.now();
  const timestamps = store.get(key) || [];
  // Remove timestamps outside of our window.
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  if (recentTimestamps.length >= maxRequests) {
    // Update store with only the recent timestamps.
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
  // --- Extract client IP ---
  // Depending on your deployment, you might need to adjust which header(s) you check.
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown";

  // --- Parse body ---
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json(
      { message: "Email is required." },
      { status: 400 }
    );
  }

  // --- Apply IP-Based Rate Limiting ---
  if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
    return NextResponse.json(
      { message: "Too many requests from this IP. Please try again later." },
      { status: 429 }
    );
  }

  // --- Apply Email/User-Based Rate Limiting ---
  if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
    return NextResponse.json(
      { message: "Too many requests for this email. Please try again later." },
      { status: 429 }
    );
  }

  // --- Check for Cooldown (e.g., prevent successive resend attempts) ---
  if (isInCooldown(email)) {
    return NextResponse.json(
      { message: "Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  // --- Continue with existing route logic ---
  await connectToDatabase();
  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  if (user.emailVerified) {
    return NextResponse.json(
      { message: "Email is already verified." },
      { status: 400 }
    );
  }

  // Remove any existing verification tokens.
  await Token.deleteMany({
    userId: user._id,
    type: { $in: ["emailVerification", "verification"] },
  });

  // Regenerate the email verification token (link).
  const linkToken = crypto.randomBytes(32).toString("hex");
  const linkExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await new Token({
    userId: user._id,
    token: linkToken,
    expiresAt: linkExpiresAt,
    type: "emailVerification",
  }).save();

  // Regenerate the OTP and hash it.
  const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otpPlain, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await new Token({
    userId: user._id,
    token: hashedOTP,
    expiresAt: otpExpiresAt,
    type: "verification",
  }).save();

  // Compose the verification email message.
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${linkToken}`;
  const emailContent = `
    A new verification email has been requested. Please verify your email by clicking the link below:<br>
    <a href="${verificationUrl}">Verify Email</a><br><br>
    Alternatively, use the OTP: <strong>${otpPlain}</strong> (expires in 10 minutes).
  `;

  await sendEmail(email, "Resend Verification - Verify Your Email Address", emailContent);

  return NextResponse.json(
    { message: "A new verification email has been sent. Please check your inbox." },
    { status: 200 }
  );
}
