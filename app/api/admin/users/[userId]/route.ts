import { connectToDatabase } from "@/lib/mongodb";
import User from "@/model/User";
import { NextResponse } from "next/server";

export async function GET(
  req: Request, 
  { params }: { params: { userId: string } }
) {
  try {
    await connectToDatabase();
    
    const user = await User.findById(params.userId).lean();
    
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Let Mongoose's toJSON transform handle the conversion
    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}