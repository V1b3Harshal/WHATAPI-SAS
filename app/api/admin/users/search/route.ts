// app/api/admin/users/search/route.ts
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '';
  
  const users = await User.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { email: { $regex: query, $options: 'i' } }
    ]
  }).sort({ createdAt: -1 }).limit(20).lean();

  const transformedUsers = users.map(user => ({
    ...user,
    id: user._id.toString(),
    _id: user._id.toString()
  }));

  return NextResponse.json({ users: transformedUsers });
}