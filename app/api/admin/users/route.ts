//app\api\admin\users\route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET() {
  await connectToDatabase();
  const users = await User.find().sort({ createdAt: -1 }).lean();
  
  // Transform data to include both _id and id fields
  const transformedUsers = users.map(user => ({
    ...user,
    id: user._id.toString(), // Add id field
    _id: user._id.toString() // Convert ObjectId to string
  }));

  return NextResponse.json({ users: transformedUsers });
}