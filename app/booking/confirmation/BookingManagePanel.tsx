"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { BookingRecord } from "@/lib/types";
import { todayIso } from "@/lib/dates";

export default function BookingManagePanel({
  booking,
  token,
}: {
  booking: BookingRecord;
  token?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editable =
    booking.status !== "completed" && booking.status !== "cancelled";
  const canCancel = editable && booking.date > todayIso();

  if (!token || !editable) return null;

  const manageHref = `/booking/manage?ref=${encodeURIComponent(
    booking.ref
  )}&token=${encodeURIComponent(token)}`;

  async function handleCancel() {
    if (!window.confirm("Cancel this booking? It cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: booking.ref, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not cancel the booking.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-9 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
      <Link
        href={manageHref}
        className="focus-ring rounded-full border border-ink/20 px-6 py-3 font-body text-sm font-medium text-ink hover:bg-ink hover:text-cream"
      >
        Edit booking
      </Link>
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={busy}
          className="focus-ring rounded-full border border-red-400/40 px-6 py-3 font-body text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
        >
          {busy ? "Cancelling…" : "Cancel booking"}
        </button>
      )}
      {error && (
        <p role="alert" className="w-full font-body text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}