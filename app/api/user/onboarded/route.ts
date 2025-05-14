// app/api/user/onboarded/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import Activity from "@/model/Activity";

interface JWTPayload {
  userId: string | { buffer: any };
  onboarded?: boolean;
  email?: string;
  sessionId?: string;
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("Missing JWT_SECRET environment variable");
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const { userId, email, sessionId } = payload as unknown as JWTPayload;
    if (!userId) {
      return NextResponse.json({ message: "Invalid token payload" }, { status: 401 });
    }

    let userIdString: string;
    if (typeof userId === "string") {
      userIdString = userId;
    } else if (userId && typeof userId === "object" && userId.buffer) {
      userIdString = Buffer.from(Object.values(userId.buffer)).toString("hex");
    } else {
      userIdString = userId.toString();
    }

    // Fetch the user from the database and check banned state
    const user = await User.findById(userIdString);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    if (user.banned) {
      return NextResponse.json({ message: "User account is banned" }, { status: 403 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userIdString,
      { onboarded: true },
      { new: true }
    );
    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { name } = updatedUser;

    // Include the existing sessionId in the new token payload (if available)
    const newToken = await new SignJWT({
      userId: userIdString,
      onboarded: true,
      email,
      name,
      sessionId, // preserve the sessionId in the new token
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(secret);

    // Log onboarding activity
    await Activity.create({
      userId: user._id,
      action: "Onboarded",
      details: {}
    });

    const response = NextResponse.json({
      message: "User onboarded successfully",
      onboarded: true,
    });

    response.cookies.set("session", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      domain: process.env.NODE_ENV === "development" ? "localhost" : undefined,
    });

    return response;
  } catch (error) {
    console.error("Error updating onboarding:", error);
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Error updating onboarding",
      },
      { status: 500 }
    );
  }
}
