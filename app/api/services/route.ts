import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB, generateId } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.services);
}

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const body = await req.json();
  const { name, description, price, durationMinutes } = body;

  if (!name || !description || price == null || durationMinutes == null) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const db = readDB();
  const newService = {
    id: generateId("svc"),
    name,
    description,
    price: Number(price),
    durationMinutes: Number(durationMinutes),
    active: true,
  };
  db.services.push(newService);
  writeDB(db);

  return NextResponse.json(newService, { status: 201 });
}
