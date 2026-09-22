import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readDB } from "@/lib/db";

const benefits = [
  {
    title: "Prices that stay put",
    body: "One flat price per service, shown before you book. No surprise add-ons at the till.",
  },
  {
    title: "Book from your phone",
    body: "Pick a service and a slot in under a minute, then just show up.",
  },
  {
    title: "Real time slots",
    body: "You only see times we can actually take your car, so there's no turning up to a queue.",
  },
  {
    title: "Every vehicle welcome",
    body: "From hatchbacks to pick-ups and vans, each wash is priced and timed for your vehicle.",
  },
];

export default async function HomePage() {
  const db = readDB();
  const featured = db.services.filter((s) => s.active).slice(0, 4);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="diagonal-bottom bg-ink pb-24 pt-16 text-cream md:pb-32 md:pt-20">
          <div className="container-shx grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="font-body text-sm font-medium text-amber">
                Car wash booking, Nairobi
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Book your wash.
                <br />
                Skip the queue.
              </h1>
              <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-cream/70">
                Shinex is a straightforward car wash booking service. Choose
                what your car needs, pick a time that works, and drive in
                knowing your bay is ready.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/booking"
                  className="focus-ring rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
                >
                  Book now
                </Link>
                <Link
                  href="/services"
                  className="focus-ring rounded-full border border-cream/25 px-7 py-3.5 font-body text-base font-medium text-cream/90 hover:border-cream/50"
                >
                  See services &amp; prices
                </Link>
              </div>
            </div>

            <div className="relative mx-auto hidden w-full max-w-md md:block">
              <HeroGraphic />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-cream py-20">
          <div className="container-shx">
            <h2 className="max-w-lg font-display text-3xl font-semibold text-ink md:text-4xl">
              A wash service built around your time, not ours
            </h2>
            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2">
              {benefits.map((b, i) => (
                <div key={b.title} className="flex gap-4">
                  <span className="font-display text-2xl font-semibold text-amber-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {b.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[15px] leading-relaxed text-slate">
                      {b.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services teaser */}
        <section className="bg-paper py-20">
          <div className="container-shx">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
                What we offer
              </h2>
              <Link
                href="/services"
                className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
              >
                View full price list
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between rounded-2xl border border-black/5 bg-cream p-6"
                >
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {s.name}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-slate">
                      {s.description}
                    </p>
                  </div>
                  <div className="mt-6 flex items-baseline justify-between">
                    <span className="font-display text-xl font-semibold text-ink">
                      KES {s.price.toLocaleString()}
                    </span>
                    <span className="font-body text-xs text-slate">
                      ~{s.durationMinutes} min
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="bg-teal-deep py-16 text-cream">
          <div className="container-shx flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Your car, cleaned on your schedule.
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Booking takes less time than the wash itself.
              </p>
            </div>
            <Link
              href="/booking"
              className="focus-ring shrink-0 rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Book a wash
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function HeroGraphic() {
  return (
    <svg
      viewBox="0 0 420 380"
      fill="none"
      className="w-full"
      aria-hidden="true"
    >
      <circle cx="210" cy="190" r="170" fill="#16222F" />
      <g opacity="0.9">
        <rect x="70" y="180" width="280" height="90" rx="18" fill="#F2A63B" />
        <path
          d="M100 180 L135 120 H285 L320 180 Z"
          fill="#F2A63B"
        />
        <path
          d="M100 180 L135 120 H285 L320 180"
          stroke="#0E1721"
          strokeWidth="4"
          fill="none"
        />
        <rect x="150" y="132" width="55" height="40" rx="4" fill="#16222F" />
        <rect x="215" y="132" width="55" height="40" rx="4" fill="#16222F" />
        <circle cx="140" cy="272" r="26" fill="#0E1721" />
        <circle cx="140" cy="272" r="10" fill="#F7F4EC" />
        <circle cx="290" cy="272" r="26" fill="#0E1721" />
        <circle cx="290" cy="272" r="10" fill="#F7F4EC" />
      </g>
      <g stroke="#5FA396" strokeWidth="3" strokeLinecap="round" opacity="0.8">
        <path d="M50 90 Q60 105 50 120" />
        <path d="M370 100 Q380 115 370 130" />
        <path d="M35 220 Q45 235 35 250" />
      </g>
      <circle cx="352" cy="60" r="7" fill="#F2A63B" />
      <circle cx="46" cy="330" r="5" fill="#5FA396" />
    </svg>
  );
}
