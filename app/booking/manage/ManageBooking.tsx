"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { BookingRecord, ServiceRecord, VehicleType } from "@/lib/types";
import { TIME_SLOTS, VEHICLE_TYPES } from "@/lib/booking-options";
import { todayISOLocal } from "@/lib/dates";

type Phase = "entry" | "loading" | "form" | "updated" | "cancelled";

export default function ManageBooking({
  services,
  initialRef,
  initialToken,
}: {
  services: ServiceRecord[];
  initialRef?: string;
  initialToken?: string;
}) {
  const [ref, setRef] = useState(initialRef ?? "");
  const [token, setToken] = useState(initialToken ?? "");
  const [phase, setPhase] = useState<Phase>(
    initialRef && initialToken ? "loading" : "entry"
  );
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [regNumber, setRegNumber] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");

  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    if (initialRef && initialToken) void lookup(initialRef, initialToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedServices = services.filter((s) => serviceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const editable =
    booking !== null &&
    booking.status !== "completed" &&
    booking.status !== "cancelled";
  const canCancel = editable && (booking?.date ?? "") > todayISOLocal();

  async function lookup(r: string, t: string) {
    if (!r.trim() || !t.trim()) {
      setError("Enter your booking reference and access code.");
      setPhase("entry");
      return;
    }
    setPhase("loading");
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: r.trim(), token: t.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not find your booking.");
        setPhase("entry");
        return;
      }
      const b = data as BookingRecord;
      setBooking(b);
      setRef(r.trim());
      setToken(t.trim());
      setVehicleType(b.vehicleType);
      setRegNumber(b.regNumber);
      setServiceIds(b.serviceIds);
      setDate(b.date);
      setTime(b.time);
      setCustomerName(b.customerName);
      setPhone(b.phone);
      setPhase("form");
    } catch {
      setError("Could not reach the server. Please try again.");
      setPhase("entry");
    }
  }

  function toggleService(id: string) {
    setServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !vehicleType ||
      !regNumber.trim() ||
      serviceIds.length === 0 ||
      !date ||
      !time ||
      !customerName.trim() ||
      !phone.trim()
    ) {
      setError("Please fill in every field before submitting.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ref,
          token,
          vehicleType,
          regNumber,
          serviceIds,
          date,
          time,
          customerName,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not update the booking.");
        return;
      }
      setBooking(data as BookingRecord);
      setPhase("updated");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!window.confirm("Cancel this booking? It cannot be undone.")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/manage", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, token }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not cancel the booking.");
        return;
      }
      setBooking(data as BookingRecord);
      setPhase("cancelled");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (phase === "loading") {
    return <PanelCard>Looking up your booking…</PanelCard>;
  }

  if (phase === "updated" || phase === "cancelled") {
    return (
      <PanelCard>
        <p className="font-display text-xl font-semibold text-ink">
          {phase === "cancelled"
            ? "Your booking has been cancelled."
            : "Your booking has been updated."}
        </p>
        <p className="mt-2 font-body text-sm text-slate">
          Reference {booking?.ref} · {booking?.date} at {booking?.time}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/booking/confirmation/${booking?.ref}?token=${encodeURIComponent(
              token
            )}`}
            className="focus-ring rounded-full border border-ink/20 px-6 py-3 font-body text-sm font-medium text-ink hover:bg-ink hover:text-cream"
          >
            View booking
          </Link>
          <Link
            href="/"
            className="focus-ring rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream"
          >
            Back to home
          </Link>
        </div>
      </PanelCard>
    );
  }

  if (phase === "form" && booking && !editable) {
    return (
      <PanelCard>
        <p className="font-display text-xl font-semibold text-ink">
          This booking can no longer be edited.
        </p>
        <p className="mt-2 font-body text-sm text-slate">
          Booking {booking.ref} is{" "}
          {booking.status.toLowerCase()} and is no longer changeable.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={`/booking/confirmation/${booking.ref}?token=${encodeURIComponent(
              token
            )}`}
            className="focus-ring rounded-full border border-ink/20 px-6 py-3 font-body text-sm font-medium text-ink hover:bg-ink hover:text-cream"
          >
            View booking
          </Link>
          <Link
            href="/"
            className="focus-ring rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream"
          >
            Back to home
          </Link>
        </div>
      </PanelCard>
    );
  }

  if (phase === "entry") {
    return (
      <PanelCard>
        <h2 className="font-display text-lg font-semibold text-ink">
          Look up your booking
        </h2>
        <p className="mt-1 font-body text-sm text-slate">
          Enter the reference and access code shown on your confirmation page.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(ref, token);
          }}
          className="mt-5 grid gap-4 sm:grid-cols-3"
        >
          <Field label="Booking reference">
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder="SHX-…"
              className="shx-input uppercase"
            />
          </Field>
          <Field label="Access code">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="From your confirmation link"
              className="shx-input"
            />
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              className="focus-ring w-full rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream hover:bg-ink-soft"
            >
              Look up
            </button>
          </div>
        </form>
        {error && (
          <p role="alert" className="mt-4 font-body text-sm text-red-600">
            {error}
          </p>
        )}
      </PanelCard>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <form onSubmit={handleUpdate} className="space-y-6">
      <div className="rounded-3xl border border-black/10 bg-paper p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">
          Booking {booking.ref}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Vehicle type">
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value as VehicleType)}
              className="shx-input"
            >
              <option value="">Select a vehicle type</option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Registration number">
            <input
              value={regNumber}
              onChange={(e) => setRegNumber(e.target.value)}
              placeholder="KDA 123A"
              className="shx-input uppercase placeholder:normal-case"
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              min={todayISOLocal()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="shx-input"
            />
          </Field>
          <Field label="Time">
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="shx-input"
            >
              <option value="">Select a time</option>
              {TIME_SLOTS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Full name">
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Jane Wanjiru"
              className="shx-input"
            />
          </Field>
          <Field label="Phone number">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712 345 678"
              className="shx-input"
            />
          </Field>
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-paper p-6 md:p-8">
        <h3 className="font-display text-lg font-semibold text-ink">
          Services
        </h3>
        <div className="mt-4 grid gap-3">
          {services.map((s) => {
            const isSelected = serviceIds.includes(s.id);
            return (
              <label
                key={s.id}
                className={`flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-5 py-4 transition-colors ${
                  isSelected
                    ? "border-ink bg-ink text-cream"
                    : "border-black/10 bg-paper hover:border-ink/30"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleService(s.id)}
                    className="h-4 w-4 accent-amber"
                  />
                  <span>
                    <span className="block font-display text-base font-semibold">
                      {s.name}
                    </span>
                    <span
                      className={`block font-body text-xs ${
                        isSelected ? "text-cream/60" : "text-slate"
                      }`}
                    >
                      ~{s.durationMinutes} min
                    </span>
                  </span>
                </span>
                <span className="font-display text-lg font-semibold">
                  KES {s.price.toLocaleString()}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-black/10 bg-paper p-6 md:p-8">
        <div className="mr-auto">
          <p className="font-body text-sm text-slate">Total</p>
          <p className="font-display text-2xl font-semibold text-ink">
            KES {totalPrice.toLocaleString()}
          </p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="focus-ring rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Updating…" : "Save changes"}
        </button>
        {canCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={busy}
            className="focus-ring rounded-full border border-red-400/40 px-7 py-3.5 font-body text-base font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
          >
            Cancel booking
          </button>
        )}
        {error && (
          <p role="alert" className="w-full font-body text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}

function PanelCard({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-paper p-8 md:p-10">
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-body text-sm font-medium text-ink/80">
        {label}
      </span>
      {children}
    </label>
  );
}