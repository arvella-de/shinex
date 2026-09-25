import { getBookings } from "@/lib/supabase";
import BookingsView from "./BookingsView";

export const metadata = { title: "Manage bookings | Shinex Admin" };

export default async function ManageBookingsPage() {
  const bookings = (await getBookings()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
        Manage bookings
      </h1>
      <p className="mt-1 font-body text-sm text-slate">
        Search, filter, and update the status of every booking.
      </p>
      <div className="mt-8">
        <BookingsView bookings={bookings} />
      </div>
    </div>
  );
}
