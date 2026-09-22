import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readDB } from "@/lib/db";

export const metadata = {
  title: "Services & pricing | Shinex Car Wash",
};

export default async function ServicesPage() {
  const db = readDB();
  const services = db.services.filter((s) => s.active);

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-ink pb-16 pt-14 text-cream">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              Services &amp; pricing
            </p>
            <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight md:text-5xl">
              Pick what your car actually needs
            </h1>
            <p className="mt-4 max-w-lg font-body text-cream/70">
              Every price is fixed and shown up front. Durations are
              estimates, so bring a little patience during busy hours.
            </p>
          </div>
        </section>

        <section className="bg-cream py-4">
          <div className="container-shx">
            <div className="divide-y divide-black/10 border-b border-black/10">
              {services.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between md:gap-10"
                >
                  <div className="max-w-xl">
                    <h2 className="font-display text-2xl font-semibold text-ink">
                      {s.name}
                    </h2>
                    <p className="mt-2 font-body text-[15px] leading-relaxed text-slate">
                      {s.description}
                    </p>
                    <p className="mt-2 font-body text-xs uppercase tracking-wide text-teal-deep">
                      Estimated time: {s.durationMinutes} minutes
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-6 md:flex-col md:items-end">
                    <span className="font-display text-3xl font-semibold text-ink">
                      KES {s.price.toLocaleString()}
                    </span>
                    <Link
                      href={{ pathname: "/booking", query: { service: s.id } }}
                      className="focus-ring rounded-full border border-ink px-5 py-2 font-body text-sm font-medium text-ink transition-colors hover:bg-ink hover:text-cream"
                    >
                      Book this
                    </Link>
                  </div>
                </div>
              ))}
              {services.length === 0 && (
                <p className="py-10 font-body text-slate">
                  No services are available for booking right now. Please
                  check back shortly.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-paper py-16">
          <div className="container-shx flex flex-col items-start justify-between gap-6 rounded-3xl bg-teal-deep px-8 py-10 text-cream md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Not sure which service fits?
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Basic Wash covers the outside, Full Detailing covers
                everything. Most drivers land on Full Wash.
              </p>
            </div>
            <Link
              href="/booking"
              className="focus-ring shrink-0 rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink"
            >
              Start a booking
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
