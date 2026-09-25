"use client";

import { useMemo, useState } from "react";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import BookingActions from "../BookingActions";

const filters: { label: string; value: BookingStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function BookingsTable({
  bookings,
}: {
  bookings: BookingRecord[];
}) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchesStatus =
        statusFilter === "all" || b.status === statusFilter;
      const matchesQuery =
        !q ||
        b.customerName.toLowerCase().includes(q) ||
        b.regNumber.toLowerCase().includes(q) ||
        b.ref.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [bookings, query, statusFilter]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, reg. number, phone, or reference"
          className="shx-input sm:max-w-sm"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`focus-ring rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-ink text-cream"
                  : "bg-black/5 text-slate hover:bg-black/10"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-black/10 bg-paper">
        {filtered.length === 0 ? (
          <p className="p-6 font-body text-sm text-slate">
            No bookings match your search.
          </p>
        ) : (
          <div className="divide-y divide-black/10">
            {filtered.map((b) => {
              const isOpen = expanded === b.id;
              return (
                <div key={b.id} className="p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <button
                      onClick={() => setExpanded(isOpen ? null : b.id)}
                      className="focus-ring flex-1 text-left"
                    >
                      <p className="font-display text-base font-semibold text-ink">
                        {b.customerName}{" "}
                        <span className="font-body text-sm font-normal text-slate">
                          · {b.ref}
                        </span>
                      </p>
                      <p className="mt-0.5 font-body text-sm text-slate">
                        {b.serviceNames.join(", ")} · {b.date} at {b.time}
                      </p>
                    </button>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={b.status} />
                      <BookingActions bookingId={b.id} status={b.status} bookingDate={b.date} />
                    </div>
                  </div>

                  {isOpen && (
                    <dl className="mt-4 grid gap-x-8 gap-y-2 rounded-xl bg-cream p-4 sm:grid-cols-3">
                      <BookingDetail label="Phone" value={b.phone} />
                      <BookingDetail
                        label="Vehicle type"
                        value={b.vehicleType}
                      />
                      <BookingDetail
                        label="Reg. number"
                        value={b.regNumber}
                      />
                      <BookingDetail
                        label="Price"
                        value={`KES ${b.price.toLocaleString()}`}
                      />
                      <BookingDetail
                        label="Booked on"
                        value={new Date(b.createdAt).toLocaleString()}
                      />
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-xs uppercase tracking-wide text-slate">
        {label}
      </dt>
      <dd className="font-body text-sm font-medium text-ink">{value}</dd>
    </div>
  );
}
