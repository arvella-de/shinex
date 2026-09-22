"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BookingStatus } from "@/lib/types";

export default function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: BookingStatus) {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "confirmed" && status !== "completed" && (
        <ActionButton
          onClick={() => setStatus("confirmed")}
          disabled={loading}
          tone="teal"
        >
          Confirm
        </ActionButton>
      )}
      {status !== "completed" && status !== "cancelled" && (
        <ActionButton
          onClick={() => setStatus("completed")}
          disabled={loading}
          tone="ink"
        >
          Mark complete
        </ActionButton>
      )}
      {status !== "cancelled" && status !== "completed" && (
        <ActionButton
          onClick={() => setStatus("cancelled")}
          disabled={loading}
          tone="muted"
        >
          Cancel
        </ActionButton>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  tone: "teal" | "ink" | "muted";
}) {
  const tones = {
    teal: "bg-teal text-cream hover:bg-teal-deep",
    ink: "bg-ink text-cream hover:bg-ink-soft",
    muted: "bg-black/5 text-slate hover:bg-black/10",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`focus-ring rounded-full px-4 py-1.5 font-body text-xs font-medium transition-colors disabled:opacity-50 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}
