import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Name, email, and message are required" },
      { status: 400 }
    );
  }

  // In production, send email or store in DB
  console.log("Contact form submission:", { name, email, phone, subject, message });

  return NextResponse.json({ success: true });
}
