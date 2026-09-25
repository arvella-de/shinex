import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatusBadge from "@/components/StatusBadge";
import { getBookingByRef } from "@/lib/supabase";
import BookingManagePanel from "../BookingManagePanel";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Booking confirmed | Shinex Car Wash",
};

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { ref } = await params;
  const { token } = await searchParams;
  const booking = await getBookingByRef(ref);

  if (!booking) {
    notFound();
  }

  return (
    <>
      <Navbar />
      <main className="bg-cream py-16">
        <div className="container-shx max-w-2xl">
          <div className="rounded-3xl border border-black/10 bg-paper p-8 md:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-sm font-medium text-teal-deep">
                  Booking confirmed
                </p>
                <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
                  Thanks, {booking.customerName.split(" ")[0]}
                </h1>
              </div>
              <StatusBadge status={booking.status} />
            </div>

            <div className="mt-6 rounded-2xl bg-ink px-6 py-5 text-cream">
              <p className="font-body text-xs uppercase tracking-wide text-cream/50">
                Booking reference
              </p>
              <p className="mt-1 font-display text-2xl font-semibold tracking-wide">
                {booking.ref}
              </p>
              <p className="mt-1 font-body text-xs text-cream/50">
                Save this reference &mdash; show it when you arrive.
              </p>
            </div>

            <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <Detail label="Customer name" value={booking.customerName} />
              <Detail label="Phone number" value={booking.phone} />
              <Detail label="Vehicle type" value={booking.vehicleType} />
              <Detail label="Registration number" value={booking.regNumber} />
              <div className="sm:col-span-2">
                <dt className="font-body text-xs uppercase tracking-wide text-slate">
                  Services
                </dt>
                <dd className="mt-1 space-y-1">
                  {booking.serviceNames.map((name, i) => (
                    <span
                      key={i}
                      className="mr-2 inline-block rounded-full bg-cream px-3 py-1 font-body text-sm font-medium text-ink"
                    >
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
              <Detail
                label="Total price"
                value={`KES ${booking.price.toLocaleString()}`}
              />
              <Detail label="Date" value={booking.date} />
              <Detail label="Time" value={booking.time} />
            </dl>

            <BookingManagePanel booking={booking} token={token} />

            <div className="mt-9 flex flex-wrap gap-3 border-t border-black/10 pt-6">
              <Link
                href="/"
                className="focus-ring rounded-full bg-ink px-6 py-3 font-body text-sm font-medium text-cream"
              >
                Back to home
              </Link>
              <Link
                href="/booking"
                className="focus-ring rounded-full border border-ink/20 px-6 py-3 font-body text-sm font-medium text-ink"
              >
                Book another wash
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-body text-xs uppercase tracking-wide text-slate">
        {label}
      </dt>
      <dd className="mt-1 font-body text-base font-medium text-ink">
        {value}
      </dd>
    </div>
  );
}
