import { NextRequest, NextResponse } from "next/server";
import { readDB } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  const db = readDB();

  if (
    username === db.admin.username &&
    password === db.admin.password
  ) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(SESSION_COOKIE, "true", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });
    return res;
  }

  return NextResponse.json(
    { error: "Incorrect username or password." },
    { status: 401 }
  );
}
