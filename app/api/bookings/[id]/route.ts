import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = readDB();
  const booking = db.bookings.find(
    (b) => b.id === id || b.ref === id
  );
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  return NextResponse.json(booking);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const { status } = await req.json();
  const allowed = ["pending", "confirmed", "completed", "cancelled"];
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const db = readDB();
  const idx = db.bookings.findIndex(
    (b) => b.id === id || b.ref === id
  );
  if (idx === -1) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  db.bookings[idx].status = status;
  writeDB(db);

  return NextResponse.json(db.bookings[idx]);
}
