import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, generateBookingRef, generateId } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";
import type { BookingRecord } from "@/lib/types";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const db = readDB();
  const sorted = [...db.bookings].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return NextResponse.json(sorted);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName,
    phone,
    vehicleType,
    regNumber,
    serviceId,
    date,
    time,
  } = body;

  if (
    !customerName ||
    !phone ||
    !vehicleType ||
    !regNumber ||
    !serviceId ||
    !date ||
    !time
  ) {
    return NextResponse.json(
      { error: "Please fill in every field before submitting." },
      { status: 400 }
    );
  }

  const db = readDB();
  const service = db.services.find((s) => s.id === serviceId && s.active);
  if (!service) {
    return NextResponse.json(
      { error: "Selected service is not available." },
      { status: 400 }
    );
  }

  const booking: BookingRecord = {
    id: generateId("bkg"),
    ref: generateBookingRef(),
    customerName,
    phone,
    vehicleType,
    regNumber: String(regNumber).toUpperCase(),
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    date,
    time,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  db.bookings.push(booking);
  writeDB(db);

  return NextResponse.json(booking, { status: 201 });
}
