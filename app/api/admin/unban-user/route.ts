// app/api/admin/unban-user/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
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
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    
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
        { message: "Forbidden - Only admins can unban users" },
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

    // Prevent admin from unbanning themselves if they were somehow banned
    if (targetUser._id.toString() === adminId) {
      return NextResponse.json(
        { message: "Forbidden - You cannot unban yourself" },
        { status: 403 }
      );
    }

    // Unban the user
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { banned: false },
      { new: true }
    );

    return NextResponse.json({
      message: "User has been unbanned",
      user: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        banned: updatedUser.banned
      }
    });

  } catch (error) {
    console.error("Unban user error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}