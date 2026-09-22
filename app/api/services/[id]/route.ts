import { NextRequest, NextResponse } from "next/server";
import { readDB, writeDB } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const updates = await req.json();
  const db = readDB();
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  db.services[idx] = {
    ...db.services[idx],
    ...updates,
    price:
      updates.price != null ? Number(updates.price) : db.services[idx].price,
    durationMinutes:
      updates.durationMinutes != null
        ? Number(updates.durationMinutes)
        : db.services[idx].durationMinutes,
  };
  writeDB(db);

  return NextResponse.json(db.services[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }
  const { id } = await params;
  const db = readDB();
  const exists = db.services.some((s) => s.id === id);
  if (!exists) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }
  db.services = db.services.filter((s) => s.id !== id);
  writeDB(db);

  return NextResponse.json({ ok: true });
}
