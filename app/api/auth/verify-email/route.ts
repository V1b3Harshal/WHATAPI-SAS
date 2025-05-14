// app/api/auth/verify-email/route.ts

import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import Token from "@/model/Token";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // Expect a token in the query string (?token=...)
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { message: "Verification token not provided." },
      { status: 400 }
    );
  }

  await connectToDatabase();

  // Find the token record of type "emailVerification"
  const tokenRecord = await Token.findOne({ token, type: "emailVerification" });
  if (!tokenRecord) {
    return NextResponse.json(
      {
        message:
          "Invalid token. Please request a new verification email if needed.",
      },
      { status: 400 }
    );
  }

  if (tokenRecord.expiresAt < new Date()) {
    return NextResponse.json(
      {
        message:
          "Token expired. Please request a new verification email.",
      },
      { status: 400 }
    );
  }

  // Get the user and update emailVerified
  const user = await User.findOne({ _id: tokenRecord.userId });
  if (!user) {
    return NextResponse.json(
      { message: "User not found." },
      { status: 404 }
    );
  }

  user.emailVerified = new Date();
  await user.save();

  // Remove all verification tokens for this user
  await Token.deleteMany({ userId: user._id });

  return NextResponse.json(
    { message: "Email verified successfully via verification link." },
    { status: 200 }
  );
}
