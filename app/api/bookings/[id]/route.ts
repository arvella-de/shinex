import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/auth";
import { mapBooking } from "@/lib/supabase";
import { todayIso } from "@/lib/dates";

const allowed = ["pending", "confirmed", "completed", "cancelled"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json();
  if (!allowed.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  if (status === "completed") {
    const { data: existing } = await supabase
      .from("bookings")
      .select("date")
      .eq("id", id)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (existing.date > todayIso()) {
      return NextResponse.json(
        { error: "A booking can only be marked completed on or after its appointment date." },
        { status: 400 }
      );
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json(mapBooking(data));
}