import { NextResponse } from "next/server";
import { anon } from "@/lib/supabase-client";
import { generateId } from "@/lib/ids";

export async function POST(request: Request) {
  const body = await request.json();
  const { rating, title, comment, customerName, serviceId, serviceName } = body;

  if (!rating || !comment || !customerName) {
    return NextResponse.json(
      { error: "Rating, comment, and name are required" },
      { status: 400 }
    );
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be between 1 and 5" },
      { status: 400 }
    );
  }

  const review = {
    id: generateId("rev"),
    rating: Number(rating),
    title: title || null,
    comment,
    customer_name: customerName,
    service_id: serviceId || null,
    service_name: serviceName || null,
    approved: false,
    created_at: new Date().toISOString(),
  };

  const { error } = await anon.from("reviews").insert(review);

  if (error) {
    return NextResponse.json(
      { error: "Could not submit your review. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: review.id }, { status: 201 });
}