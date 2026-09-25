import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getApprovedReviews, getFAQs } from "@/lib/supabase";
import type { ServiceCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const categories: { name: ServiceCategory; description: string; icon: string }[] = [
  { name: "Exterior Cleaning", description: "Quick, thorough washes that remove dirt, grime, and road dust from your vehicle's exterior surfaces.", icon: "💧" },
  { name: "Interior Cleaning", description: "Vacuuming, wiping, and deep cleaning to keep your cabin fresh, comfortable, and well-maintained.", icon: "🪑" },
  { name: "Full Cleaning & Detailing", description: "Complete interior and exterior packages for drivers who want their vehicle thoroughly cleaned inside and out.", icon: "✨" },
  { name: "Paint & Protection", description: "Waxing, polishing, ceramic coating, and other treatments to protect and enhance your vehicle's paintwork.", icon: "🛡️" },
  { name: "Specialized Services", description: "Engine bay cleaning, pet hair removal, odor treatment, leather care, and other targeted cleaning solutions.", icon: "🔧" },
];

const whyChooseUs = [
  { title: "Convenient Online Booking", body: "Choose your service, pick a time, and confirm in under a minute — no phone calls, no waiting." },
  { title: "Professional Cleaning", body: "Trained staff using proven techniques and quality products to deliver consistent, reliable results." },
  { title: "Quality Products", body: "We use products specifically chosen for automotive surfaces to clean effectively without causing damage." },
  { title: "Experienced Team", body: "Our team has the knowledge and experience to handle every vehicle type and service level." },
  { title: "Flexible Appointments", body: "Morning, afternoon, or weekend — pick a time that fits your schedule, not ours." },
  { title: "Reliable Service", body: "Show up at your booked time and your bay is ready. We respect your schedule." },
];

const steps = [
  { number: "01", title: "Choose a Service", body: "Browse our services and select what your vehicle needs." },
  { number: "02", title: "Select Date & Time", body: "Pick a convenient appointment from available time slots." },
  { number: "03", title: "Enter Your Details", body: "Provide your name, phone number, and vehicle information." },
  { number: "04", title: "Bring Your Vehicle", body: "Show up at your appointment and we'll take care of the rest." },
];

export default async function HomePage() {
  const reviews = (await getApprovedReviews()).slice(0, 3);

  const faqs = (await getFAQs()).slice(0, 4);

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="diagonal-bottom bg-ink pb-24 pt-16 text-cream md:pb-32 md:pt-20">
          <div className="container-shx grid items-center gap-12 md:grid-cols-2">
            <div>
              <p className="font-body text-sm font-medium text-amber">
                Professional car care, Nairobi
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Professional Car Care,
                <br />
                Made Simple.
              </h1>
              <p className="mt-6 max-w-md font-body text-lg leading-relaxed text-cream/70">
                Book car wash and detailing services online. Choose what your
                car needs, pick a time that works, and drive in knowing your
                bay is ready.
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
                  View services
                </Link>
              </div>
            </div>
            <div className="relative mx-auto hidden w-full max-w-md md:block">
              <HeroGraphic />
            </div>
          </div>
        </section>

        {/* What We Offer */}
        <section className="bg-cream py-20">
          <div className="container-shx">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
                  What we offer
                </h2>
                <p className="mt-2 font-body text-sm text-slate">
                  Professional car care services for every vehicle and budget
                </p>
              </div>
              <Link
                href="/services"
                className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
              >
                View all services
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((cat) => (
                <div
                  key={cat.name}
                  className="flex flex-col justify-between rounded-2xl border border-black/5 bg-paper p-6"
                >
                  <div>
                    <span className="text-3xl">{cat.icon}</span>
                    <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                      {cat.name}
                    </h3>
                    <p className="mt-2 font-body text-sm leading-relaxed text-slate">
                      {cat.description}
                    </p>
                  </div>
                  <Link
                    href="/services"
                    className="focus-ring mt-5 inline-block font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
                  >
                    View services &rarr;
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-paper py-20">
          <div className="container-shx">
            <h2 className="max-w-lg font-display text-3xl font-semibold text-ink md:text-4xl">
              Why choose Shinex
            </h2>
            <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {whyChooseUs.map((item, i) => (
                <div key={item.title} className="flex gap-4">
                  <span className="font-display text-2xl font-semibold text-amber-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 font-body text-[15px] leading-relaxed text-slate">
                      {item.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-cream py-20">
          <div className="container-shx">
            <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
              How it works
            </h2>
            <p className="mt-2 max-w-lg font-body text-slate">
              Booking takes less than a minute. Here is how it works.
            </p>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number}>
                  <span className="font-display text-3xl font-semibold text-amber-dim">
                    {step.number}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-slate">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Preview */}
        {reviews.length > 0 && (
          <section className="bg-paper py-20">
            <div className="container-shx">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
                    What our customers say
                  </h2>
                  <p className="mt-2 font-body text-sm text-slate">
                    Real feedback from drivers who have booked with Shinex
                  </p>
                </div>
                <Link
                  href="/reviews"
                  className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
                >
                  View all reviews
                </Link>
              </div>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {reviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-black/5 bg-cream p-6"
                  >
                    <span className="font-body text-sm text-amber-dim">
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </span>
                    {r.title && (
                      <p className="mt-2 font-display text-base font-semibold text-ink">
                        {r.title}
                      </p>
                    )}
                    <p className="mt-2 font-body text-sm leading-relaxed text-slate line-clamp-3">
                      {r.comment}
                    </p>
                    <p className="mt-3 font-body text-xs text-slate">
                      — {r.customerName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Preview */}
        {faqs.length > 0 && (
          <section className="bg-cream py-20">
            <div className="container-shx">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold text-ink md:text-4xl">
                    Frequently asked questions
                  </h2>
                  <p className="mt-2 font-body text-sm text-slate">
                    Quick answers to common questions
                  </p>
                </div>
                <Link
                  href="/faq"
                  className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
                >
                  View all FAQs
                </Link>
              </div>
              <div className="mt-8 divide-y divide-black/10 rounded-2xl border border-black/10 bg-paper">
                {faqs.map((faq) => (
                  <details key={faq.id} className="group">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 font-body text-[15px] font-medium text-ink hover:text-teal-deep">
                      {faq.question}
                      <span className="shrink-0 text-slate transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-5 pb-5 font-body text-sm leading-relaxed text-slate">
                      {faq.answer}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-teal-deep py-16 text-cream">
          <div className="container-shx flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to give your car the care it deserves?
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Choose your service and book your appointment today.
              </p>
            </div>
            <Link
              href="/booking"
              className="focus-ring shrink-0 rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Book your car wash
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
    <svg viewBox="0 0 420 380" fill="none" className="w-full" aria-hidden="true">
      <circle cx="210" cy="190" r="170" fill="#16222F" />
      <g opacity="0.9">
        <rect x="70" y="180" width="280" height="90" rx="18" fill="#F2A63B" />
        <path d="M100 180 L135 120 H285 L320 180 Z" fill="#F2A63B" />
        <path d="M100 180 L135 120 H285 L320 180" stroke="#0E1721" strokeWidth="4" fill="none" />
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
