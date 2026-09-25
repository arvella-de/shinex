import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { anon } from "@/lib/supabase-client";
import { generateBookingRef, generateId } from "@/lib/ids";
import { addBookingNotification, mapService } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    customerName,
    phone,
    vehicleType,
    regNumber,
    serviceIds,
    date,
    time,
  } = body;

  if (
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
    return NextResponse.json(
      { error: "Please fill in every field before submitting." },
      { status: 400 }
    );
  }

  const { data: rows, error: servicesError } = await anon
    .from("services")
    .select("*")
    .in("id", serviceIds);

  if (servicesError) {
    return NextResponse.json(
      { error: "Could not verify the selected services." },
      { status: 500 }
    );
  }

  const selectedServices = (rows ?? []).map((row) => mapService(row));
  const activeServices = selectedServices.filter((s) => s.active);

  if (activeServices.length !== serviceIds.length) {
    return NextResponse.json(
      { error: "One or more selected services are not available." },
      { status: 400 }
    );
  }

  const totalPrice = activeServices.reduce((sum, s) => sum + s.price, 0);
  const serviceNames = activeServices.map((s) => s.name);

  const booking = {
    id: generateId("bkg"),
    ref: generateBookingRef(),
    customer_name: customerName,
    phone,
    vehicle_type: vehicleType,
    reg_number: String(regNumber).toUpperCase(),
    service_ids: activeServices.map((s) => s.id),
    service_names: serviceNames,
    price: totalPrice,
    date,
    time_slot: time,
    status: "pending" as const,
    manage_token: randomUUID(),
    created_at: new Date().toISOString(),
  };

  const { error: insertError } = await anon.from("bookings").insert(booking);

  if (insertError) {
    return NextResponse.json(
      { error: "Could not save your booking. Please try again." },
      { status: 500 }
    );
  }

  await addBookingNotification(
    "new_booking",
    booking.ref,
    `New booking ${booking.ref} — ${booking.customer_name} · ${serviceNames.join(
      ", "
    )} · ${booking.date} ${booking.time_slot}`
  );

  return NextResponse.json(
    {
      id: booking.id,
      ref: booking.ref,
      customerName: booking.customer_name,
      phone: booking.phone,
      vehicleType: booking.vehicle_type,
      regNumber: booking.reg_number,
      serviceIds: booking.service_ids,
      serviceNames: booking.service_names,
      price: booking.price,
      date: booking.date,
      time: booking.time_slot,
      status: booking.status,
      manageToken: booking.manage_token,
      createdAt: booking.created_at,
    },
    { status: 201 }
  );
}