"use client";

import { useMemo, useState } from "react";
import type { BookingRecord, BookingStatus } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import BookingActions from "../BookingActions";
import { todayIso } from "@/lib/dates";

const STATUS_DOT: Record<BookingStatus, string> = {
  pending: "bg-amber",
  confirmed: "bg-teal",
  completed: "bg-ink",
  cancelled: "bg-slate",
};

const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function buildMonthCells(year: number, month: number): (string | null)[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - ((first.getDay() + 6) % 7));
  const cells: (string | null)[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    cells.push(d.getMonth() === month ? toISODate(d) : null);
  }
  return cells;
}

export default function BookingCalendar({
  bookings,
}: {
  bookings: BookingRecord[];
}) {
  const today = todayIso();
  const [year, setYear] = useState(() => Number(today.slice(0, 4)));
  const [month, setMonth] = useState(() => Number(today.slice(5, 7)) - 1);
  const [selected, setSelected] = useState(today);

  const byDate = useMemo(() => {
    const map = new Map<string, BookingRecord[]>();
    for (const b of bookings) {
      const list = map.get(b.date) ?? [];
      list.push(b);
      map.set(b.date, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.time.localeCompare(b.time));
    }
    return map;
  }, [bookings]);

  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);
  const dayBookings = selected ? (byDate.get(selected) ?? []) : [];

  function shift(delta: number) {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  }

  function goToday() {
    const t = todayIso();
    setYear(Number(t.slice(0, 4)));
    setMonth(Number(t.slice(5, 7)) - 1);
    setSelected(t);
  }

  const monthLabel = new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <NavChevron label="Previous month" onClick={() => shift(-1)}>
            ‹
          </NavChevron>
          <h3 className="min-w-44 text-center font-display text-lg font-semibold text-ink">
            {monthLabel}
          </h3>
          <NavChevron label="Next month" onClick={() => shift(1)}>
            ›
          </NavChevron>
        </div>
        <button
          onClick={goToday}
          className="focus-ring rounded-full bg-black/5 px-4 py-1.5 font-body text-xs font-medium text-slate transition-colors hover:bg-black/10"
        >
          Today
        </button>
      </div>

      <div className="mt-4 grid grid-cols-7 overflow-hidden rounded-2xl border border-black/10 bg-paper">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="border-b border-r border-black/10 bg-cream py-2 text-center font-body text-xs font-semibold uppercase tracking-wide text-slate last:border-r-0"
          >
            {d}
          </div>
        ))}
        {cells.map((iso, i) => {
          const list = iso ? (byDate.get(iso) ?? []) : [];
          const isSelected = iso === selected;
          const isToday = iso === today;
          return (
            <button
              key={i}
              disabled={!iso}
              onClick={() => iso && setSelected(iso)}
              className={`flex min-h-[76px] flex-col gap-1 border-b border-r border-black/5 p-2 text-left align-top transition-colors last:border-r-0 ${
                isSelected
                  ? "bg-amber-light/50 ring-1 ring-inset ring-amber"
                  : "bg-paper hover:bg-cream"
              } ${iso ? "" : "opacity-40"}`}
            >
              <span
                className={`font-body text-xs font-semibold ${
                  isToday ? "text-amber-dim" : "text-slate"
                }`}
              >
                {iso ? Number(iso.slice(8)) : ""}
              </span>
              {list.map((b) => (
                <span
                  key={b.id}
                  title={`${b.time} · ${b.customerName} · ${STATUS_LABEL[b.status]}`}
                  className="flex items-center gap-1"
                >
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[b.status]}`}
                  />
                  <span className="truncate text-[11px] font-medium text-ink">
                    {b.time} {b.customerName.split(" ")[0]}
                  </span>
                </span>
              ))}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-4">
        {(["pending", "confirmed", "completed", "cancelled"] as BookingStatus[]).map(
          (s) => (
            <span
              key={s}
              className="flex items-center gap-1.5 font-body text-xs text-slate"
            >
              <span className={`h-2 w-2 rounded-full ${STATUS_DOT[s]}`} />
              {STATUS_LABEL[s]}
            </span>
          )
        )}
      </div>

      <div className="mt-6">
        <h4 className="font-display text-base font-semibold text-ink">
          {selected ? formatDay(selected) : "Select a day"}
        </h4>
        {selected && dayBookings.length === 0 ? (
          <p className="mt-2 font-body text-sm text-slate">
            No bookings on this day.
          </p>
        ) : (
          <div className="mt-3 divide-y divide-black/10 overflow-hidden rounded-2xl border border-black/10 bg-paper">
            {dayBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-display text-sm font-semibold text-ink">
                    {b.time} · {b.customerName}
                  </p>
                  <p className="mt-0.5 font-body text-xs text-slate">
                    {b.serviceNames.join(", ")} · {b.vehicleType} · {b.regNumber}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <BookingActions
                    bookingId={b.id}
                    status={b.status}
                    bookingDate={b.date}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NavChevron({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-paper font-display text-lg text-ink transition-colors hover:bg-ink hover:text-cream"
    >
      {children}
    </button>
  );
}

function formatDay(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}