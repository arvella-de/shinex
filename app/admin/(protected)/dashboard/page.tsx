import Link from "next/link";
import { getBookings, getNotifications } from "@/lib/supabase";
import { todayIso } from "@/lib/dates";
import StatusBadge from "@/components/StatusBadge";
import BookingActions from "../BookingActions";
import ActivityFeed from "./ActivityFeed";

export const metadata = { title: "Admin dashboard | Shinex" };

export default async function AdminDashboardPage() {
  const bookings = (await getBookings()).sort((a, b) =>
    `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)
  );
  const notifications = await getNotifications(10);

  const today = todayIso();
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    today: bookings.filter((b) => b.date === today).length,
  };

  const upcoming = bookings
    .filter((b) => b.status === "pending" || b.status === "confirmed")
    .slice(0, 6);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
          Dashboard
        </h1>
        <Link
          href="/admin/bookings"
          className="focus-ring rounded-full border border-ink/15 px-4 py-2 font-body text-sm text-ink hover:bg-ink hover:text-cream"
        >
          View all bookings
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total bookings" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} accent="amber" />
        <StatCard label="Confirmed" value={stats.confirmed} accent="teal" />
        <StatCard label="Today" value={stats.today} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-ink">
          Upcoming appointments
        </h2>
        <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-paper">
          {upcoming.length === 0 ? (
            <p className="p-6 font-body text-sm text-slate">
              No upcoming appointments right now.
            </p>
          ) : (
            <div className="divide-y divide-black/10">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-display text-base font-semibold text-ink">
                      {b.customerName}{" "}
                      <span className="font-body text-sm font-normal text-slate">
                        · {b.serviceNames.join(", ")}
                      </span>
                    </p>
                    <p className="mt-0.5 font-body text-sm text-slate">
                      {b.date} at {b.time} · {b.vehicleType} · {b.regNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={b.status} />
                    <BookingActions bookingId={b.id} status={b.status} bookingDate={b.date} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-10">
        <ActivityFeed notifications={notifications} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "amber" | "teal";
}) {
  const accentColor =
    accent === "amber"
      ? "text-amber-dim"
      : accent === "teal"
      ? "text-teal-deep"
      : "text-ink";
  return (
    <div className="rounded-2xl border border-black/10 bg-paper p-6">
      <p className="font-body text-sm text-slate">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${accentColor}`}>
        {value}
      </p>
    </div>
  );
}
