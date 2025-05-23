// app/api/admin/ban-user/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import RefreshToken from "@/model/RefreshToken";
import Session from "@/model/Session";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

interface CustomJWTPayload {
  userId: string;
  email: string;
  role?: string;
}

export async function POST(req: Request) {
  try {
    await connectToDatabase();

    // Get the admin's session token
    const cookieStore = cookies(); // No await needed here
    const token = (await cookieStore).get('session')?.value;
    
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No session token" },
        { status: 401 }
      );
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    // Verify the token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    if (!payload || typeof payload !== 'object') {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Cast the payload
    const { userId: adminId, role } = payload as unknown as CustomJWTPayload;

    // Verify the requester is an admin
    if (role !== 'admin') {
      return NextResponse.json(
        { message: "Forbidden - Only admins can ban users" },
        { status: 403 }
      );
    }

    // Get the target user ID from request body
    const { userId: targetUserId } = await req.json();

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent admin from banning themselves
    if (targetUser._id.toString() === adminId) {
      return NextResponse.json(
        { message: "Forbidden - You cannot ban yourself" },
        { status: 403 }
      );
    }

    // Prevent admin from banning other admins
    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { message: "Forbidden - You cannot ban another admin" },
        { status: 403 }
      );
    }

    // Mark the user as banned
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { banned: true },
      { new: true }
    );

    // Check if the update was successful
    if (!updatedUser) {
      return NextResponse.json(
        { message: "Failed to ban user - user not found" },
        { status: 404 }
      );
    }

    // Remove all refresh tokens and sessions
    await Promise.all([
      RefreshToken.deleteMany({ userId: targetUserId }),
      Session.deleteMany({ userId: targetUserId })
    ]);

    return NextResponse.json({
      message: "User has been banned and all sessions/tokens have been revoked",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        banned: updatedUser.banned
      }
    });

  } catch (error) {
    console.error("Ban user error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}