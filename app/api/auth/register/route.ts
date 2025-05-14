// app/api/auth/register/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

// --- In-Memory Stores for Rate Limiting & Cooldown ---
// Note: These maps are per instance. In production, consider a distributed solution.
const ipRateLimitStore: Map<string, number[]> = new Map();
const emailRateLimitStore: Map<string, number[]> = new Map();
const regCooldownStore: Map<string, number> = new Map();

// --- Rate Limiting & Cooldown Configuration ---
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
  // Remove timestamps outside of the window.
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
  const lastRequestTime = regCooldownStore.get(email);
  if (lastRequestTime && (Date.now() - lastRequestTime < COOLDOWN_PERIOD)) {
    return true;
  }
  regCooldownStore.set(email, Date.now());
  return false;
}

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // Validate required fields.
  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Name, email and password are required" },
      { status: 400 }
    );
  }

  // --- Extract Client IP ---
  // Use common headers; adjust based on your deployment.
  const ip = req.headers.get("x-forwarded-for") ||
             req.headers.get("x-real-ip") ||
             "unknown";

  // --- Apply Rate Limiting ---
  if (checkRateLimit(ip, ipRateLimitStore, MAX_REQUESTS_PER_IP)) {
    return NextResponse.json(
      { message: "Too many requests from this IP, please try again later." },
      { status: 429 }
    );
  }
  if (checkRateLimit(email, emailRateLimitStore, MAX_REQUESTS_PER_EMAIL)) {
    return NextResponse.json(
      { message: "Too many registration requests for this email, please try again later." },
      { status: 429 }
    );
  }
  if (isInCooldown(email)) {
    return NextResponse.json(
      { message: "Please wait a moment before trying to register again." },
      { status: 429 }
    );
  }

  await connectToDatabase();

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json(
      { message: "User already exists" },
      { status: 400 }
    );
  }

  // Hash the password and create a new user.
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    name,
    email,
    password: hashedPassword,
    emailVerified: null,
  });
  await user.save();

  // Generate email verification token (for clickable link).
  const linkToken = crypto.randomBytes(32).toString("hex");
  const linkExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes.

  await new Token({
    userId: user._id,
    token: linkToken,
    expiresAt: linkExpiresAt,
    type: "emailVerification",
  }).save();

  // Generate a 6-digit OTP, hash it, and save it for OTP verification.
  const otpPlain = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOTP = await bcrypt.hash(otpPlain, 10);
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes.

  await new Token({
    userId: user._id,
    token: hashedOTP, // Stored hashed.
    expiresAt: otpExpiresAt,
    type: "verification",
  }).save();

  // Compose the verification email message.
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${linkToken}`;
  const emailContent = `
    Please verify your email by clicking the link below:<br>
    <a href="${verificationUrl}">Verify Email</a><br><br>
    Alternatively, you can use the OTP: <strong>${otpPlain}</strong> (expires in 10 minutes).
  `;

  await sendEmail(email, "Verify Your Email Address", emailContent);

  return NextResponse.json(
    { message: "Verification email sent. Please check your inbox." },
    { status: 201 }
  );
}
