"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ServiceRecord, VehicleType } from "@/lib/types";
import { TIME_SLOTS, VEHICLE_TYPES } from "@/lib/booking-options";
import { todayISOLocal } from "@/lib/dates";

export default function BookingForm({
  services,
  preselectedServiceId,
}: {
  services: ServiceRecord[];
  preselectedServiceId?: string;
}) {
  const router = useRouter();
  const [vehicleType, setVehicleType] = useState<VehicleType | "">("");
  const [regNumber, setRegNumber] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(
    preselectedServiceId && services.some((s) => s.id === preselectedServiceId)
      ? [preselectedServiceId]
      : []
  );
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedServices = services.filter((s) =>
    selectedServiceIds.includes(s.id)
  );
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

  function toggleService(serviceId: string) {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (
      !vehicleType ||
      !regNumber.trim() ||
      selectedServiceIds.length === 0 ||
      !date ||
      !time ||
      !customerName.trim() ||
      !phone.trim()
    ) {
      setError("Please fill in every field before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType,
          regNumber,
          serviceIds: selectedServiceIds,
          date,
          time,
          customerName,
          phone,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/booking/confirmation/${data.ref}?token=${data.manageToken}`);
    } catch {
      setError("Could not reach the server. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-10 lg:grid-cols-[1fr_360px]"
    >
      <div className="space-y-10">
        <FormSection number="01" title="Your vehicle">
          <div className="grid gap-5 sm:grid-cols-2">
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
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="KDA 123A"
                className="shx-input uppercase placeholder:normal-case"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection number="02" title="Choose services">
          <p className="mb-3 font-body text-xs text-slate">
            Select one or more services
          </p>
          <div className="grid gap-3">
            {services.map((s) => {
              const isSelected = selectedServiceIds.includes(s.id);
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
        </FormSection>

        <FormSection number="03" title="Pick a date & time">
          <div className="grid gap-5 sm:grid-cols-2">
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
          </div>
        </FormSection>

        <FormSection number="04" title="Your details">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name">
              <input
                type="text"
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
        </FormSection>

        {error && (
          <p
            role="alert"
            className="rounded-lg bg-amber-light px-4 py-3 font-body text-sm text-amber-dim"
          >
            {error}
          </p>
        )}
      </div>

      {/* Summary panel */}
      <aside className="h-fit rounded-2xl border border-black/10 bg-paper p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-lg font-semibold text-ink">
          Booking summary
        </h2>
        <dl className="mt-5 space-y-3 font-body text-sm">
          <SummaryRow label="Vehicle" value={vehicleType || "—"} />
          <SummaryRow label="Reg. number" value={regNumber || "—"} />
          <div>
            <dt className="text-slate">Services</dt>
            <dd className="mt-1 space-y-1">
              {selectedServices.length > 0 ? (
                selectedServices.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium text-ink">{s.name}</span>
                    <span className="text-ink">
                      KES {s.price.toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <span className="text-ink">—</span>
              )}
            </dd>
          </div>
          <SummaryRow label="Date" value={date || "—"} />
          <SummaryRow label="Time" value={time || "—"} />
        </dl>
        <div className="mt-5 flex items-baseline justify-between border-t border-black/10 pt-4">
          <span className="font-body text-sm text-slate">Total</span>
          <span className="font-display text-2xl font-semibold text-ink">
            KES {totalPrice.toLocaleString()}
          </span>
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="focus-ring mt-6 w-full rounded-full bg-amber px-6 py-3.5 font-body text-base font-semibold text-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
        <p className="mt-3 font-body text-xs leading-relaxed text-slate">
          Payment is made at the bay. You&apos;ll get a booking reference on
          the next screen.
        </p>
      </aside>
    </form>
  );
}

function FormSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <span className="mt-1 font-display text-sm font-semibold text-amber-dim">
        {number}
      </span>
      <div className="flex-1">
        <h2 className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        <div className="mt-4">{children}</div>
      </div>
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
