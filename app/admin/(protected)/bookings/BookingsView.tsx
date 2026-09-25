"use client";

import { useState } from "react";
import type { BookingRecord } from "@/lib/types";
import BookingsTable from "./BookingsTable";
import BookingCalendar from "./BookingCalendar";

export default function BookingsView({
  bookings,
}: {
  bookings: BookingRecord[];
}) {
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div>
      <div className="mb-5 flex gap-2">
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`focus-ring rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
              view === v
                ? "bg-ink text-cream"
                : "bg-black/5 text-slate hover:bg-black/10"
            }`}
          >
            {v === "list" ? "List" : "Calendar"}
          </button>
        ))}
      </div>
      {view === "list" ? (
        <BookingsTable bookings={bookings} />
      ) : (
        <BookingCalendar bookings={bookings} />
      )}
    </div>
  );
}