// lib/middleware/admin.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function verifyAdmin() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('session')?.value;
  if (!token) {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
  const { payload } = await jwtVerify(token, secret);
  if (!payload || typeof payload !== 'object') {
    return { error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const { userId, role } = payload as unknown as { userId: string; role?: string };
  if (role !== 'admin') {
    return { error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { userId };
}