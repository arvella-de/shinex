import type { BookingStatus } from "@/lib/types";

const styles: Record<BookingStatus, string> = {
  pending: "bg-amber-light text-amber-dim",
  confirmed: "bg-teal-light/40 text-teal-deep",
  completed: "bg-ink text-cream",
  cancelled: "bg-black/5 text-slate line-through",
};

const labels: Record<BookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-body text-xs font-medium ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
