"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationRecord, NotificationType } from "@/lib/types";

const typeLabels: Record<NotificationType, string> = {
  new_booking: "New booking",
  booking_updated: "Booking updated",
  booking_cancelled: "Booking cancelled",
};

const typeStyles: Record<NotificationType, string> = {
  new_booking: "bg-teal-light/40 text-teal-deep",
  booking_updated: "bg-amber-light text-amber-dim",
  booking_cancelled: "bg-black/5 text-slate",
};

export default function ActivityFeed({
  notifications,
}: {
  notifications: NotificationRecord[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    setBusy(true);
    const res = await fetch("/api/admin/notifications", { method: "POST" });
    setBusy(false);
    if (res.ok) router.refresh();
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10 bg-paper">
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <h2 className="font-display text-lg font-semibold text-ink">
          Recent activity
        </h2>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            disabled={busy}
            className="focus-ring rounded-full bg-black/5 px-4 py-1.5 font-body text-xs font-medium text-slate transition-colors hover:bg-black/10 disabled:opacity-60"
          >
            Mark all read
          </button>
        )}
      </div>
      {notifications.length === 0 ? (
        <p className="p-6 font-body text-sm text-slate">
          No activity yet. Notifications will appear here when customers book,
          update, or cancel a booking.
        </p>
      ) : (
        <ul className="divide-y divide-black/10">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 p-4 ${
                n.read ? "" : "bg-amber-light/30"
              }`}
            >
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  n.read ? "bg-black/20" : "bg-amber"
                }`}
              />
              <div className="min-w-0">
                <p className="font-body text-sm font-medium text-ink">
                  {n.message}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-2 font-body text-xs text-slate">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      typeStyles[n.type]
                    }`}
                  >
                    {typeLabels[n.type]}
                  </span>
                  <span>{relativeTime(n.createdAt)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}