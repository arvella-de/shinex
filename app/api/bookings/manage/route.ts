import { NextRequest, NextResponse } from "next/server";
import { anon } from "@/lib/supabase-client";
import {
  addBookingNotification,
  getActiveServicesByIds,
  mapBooking,
  type BookingRow,
} from "@/lib/supabase";
import { todayIso } from "@/lib/dates";

async function bookingForToken(
  ref: string,
  token: string
): Promise<BookingRow | null> {
  const { data, error } = await anon.rpc("get_booking_by_ref_token", {
    p_ref: ref,
    p_token: token,
  });
  if (error) return null;
  return (data as BookingRow) ?? null;
}

function json(
  body: Record<string, unknown>,
  status: number
): NextResponse {
  return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
  const { ref, token } = await req.json();

  if (!ref || !token) {
    return json({ error: "Booking reference and access code are required." }, 400);
  }

  const row = await bookingForToken(ref, token);
  if (!row) {
    return json({ error: "Booking not found." }, 404);
  }

  return NextResponse.json(mapBooking(row));
}

export async function PATCH(req: NextRequest) {
  const {
    ref,
    token,
    customerName,
    phone,
    vehicleType,
    regNumber,
    serviceIds,
    date,
    time,
  } = await req.json();

  if (
    !ref ||
    !token ||
    !customerName ||
    !phone ||
    !vehicleType ||
    !regNumber ||
    !serviceIds ||
    !Array.isArray(serviceIds) ||
    serviceIds.length === 0 ||
    !date ||
    !time
  ) {
    return json({ error: "Please fill in every field before submitting." }, 400);
  }

  const current = await bookingForToken(ref, token);
  if (!current) {
    return json({ error: "Booking not found." }, 404);
  }
  if (current.status === "completed" || current.status === "cancelled") {
    return json({ error: "This booking can no longer be edited." }, 409);
  }

  let selectedServices;
  try {
    selectedServices = await getActiveServicesByIds(serviceIds);
  } catch {
    return json({ error: "Could not verify the selected services." }, 500);
  }

  if (selectedServices.length !== serviceIds.length) {
    return json({ error: "One or more selected services are not available." }, 400);
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const serviceNames = selectedServices.map((s) => s.name);

  const { data, error } = await anon.rpc("update_booking_customer", {
    p_ref: ref,
    p_token: token,
    p_customer_name: customerName,
    p_phone: phone,
    p_vehicle_type: vehicleType,
    p_reg_number: String(regNumber).toUpperCase(),
    p_service_ids: serviceIds,
    p_service_names: serviceNames,
    p_price: totalPrice,
    p_date: date,
    p_time_slot: time,
  });

  if (error || !data) {
    return json({ error: "This booking can no longer be edited." }, 409);
  }

  await addBookingNotification(
    "booking_updated",
    ref,
    `Booking ${ref} updated — ${customerName}`
  );

  return NextResponse.json(mapBooking(data as BookingRow));
}

export async function DELETE(req: NextRequest) {
  const { ref, token } = await req.json();

  if (!ref || !token) {
    return json({ error: "Booking reference and access code are required." }, 400);
  }

  const current = await bookingForToken(ref, token);
  if (!current) {
    return json({ error: "Booking not found." }, 404);
  }
  if (current.status === "completed" || current.status === "cancelled") {
    return json({ error: "This booking can no longer be cancelled." }, 409);
  }
  if (current.date <= todayIso()) {
    return json(
      { error: "Bookings can no longer be cancelled once the appointment date has arrived." },
      409
    );
  }

  const { data, error } = await anon.rpc("cancel_booking_by_token", {
    p_ref: ref,
    p_token: token,
    p_today: todayIso(),
  });

  if (error || !data) {
    return json({ error: "This booking can no longer be cancelled." }, 409);
  }

  await addBookingNotification(
    "booking_cancelled",
    ref,
    `Booking ${ref} cancelled — ${current.customer_name}`
  );

  return NextResponse.json(mapBooking(data as BookingRow));
}