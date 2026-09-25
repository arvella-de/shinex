import { NextResponse } from "next/server";
import { getServerSupabase } from "@/lib/auth";

export async function POST() {
  const supabase = await getServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("read", false);

  if (error) {
    return NextResponse.json(
      { error: "Could not update notifications" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}