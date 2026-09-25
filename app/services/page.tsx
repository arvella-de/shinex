import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServices } from "@/lib/supabase";
import type { ServiceCategory } from "@/lib/types";

export const dynamic = "force-dynamic";

const categoryOrder: ServiceCategory[] = [
  "Exterior Cleaning",
  "Interior Cleaning",
  "Full Cleaning & Detailing",
  "Paint & Protection",
  "Specialized Services",
];

const categoryDescriptions: Record<ServiceCategory, string> = {
  "Exterior Cleaning": "Fast, effective washes to remove dirt, dust, and road grime.",
  "Interior Cleaning": "Deep cleaning for your cabin, seats, dashboard, and surfaces.",
  "Full Cleaning & Detailing": "Complete interior and exterior care in one appointment.",
  "Paint & Protection": "Polish, wax, ceramic, and coatings to protect and restore your finish.",
  "Specialized Services": "Engine cleaning, odour removal, leather care, and more.",
};

export default async function ServicesPage() {
  const services = await getServices();

  const grouped = categoryOrder.map((cat) => ({
    category: cat,
    description: categoryDescriptions[cat],
    services: services.filter((s) => s.category === cat),
  })).filter((g) => g.services.length > 0);

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              Our services
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              Car Cleaning &amp; Detailing
              <br />
              Services
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              Choose from five categories of professional car care. Every
              service includes an assigned bay, checked supplies, and a
              trained cleaning team.
            </p>
          </div>
        </section>

        {/* Category sections */}
        {grouped.map((group) => (
          <section
            key={group.category}
            className="border-t border-black/5 bg-paper py-12"
          >
            <div className="container-shx">
              <h2 className="font-display text-2xl font-semibold text-ink">
                {group.category}
              </h2>
              <p className="mt-1 font-body text-sm text-slate">
                {group.description}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.services.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col justify-between rounded-2xl border border-black/5 bg-cream p-6"
                  >
                    <div>
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {service.name}
                      </h3>
                      <p className="mt-2 font-body text-sm leading-relaxed text-slate">
                        {service.description}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="font-body text-sm text-slate">
                        <span>{service.durationMinutes} min</span>
                        <span className="mx-1.5 text-ink/20">·</span>
                        <span className="font-semibold text-ink">
                          KES {service.price}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/services/${service.id}`}
                          className="focus-ring rounded-full border border-black/10 px-3.5 py-1.5 font-body text-xs font-medium text-ink/70 hover:border-ink/30"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/booking?service=${service.id}`}
                          className="focus-ring rounded-full bg-amber px-3.5 py-1.5 font-body text-xs font-medium text-ink"
                        >
                          Book
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="bg-teal-deep py-16 text-cream">
          <div className="container-shx flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to book?
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Choose your service, pick a time, and let us take care of
                the rest.
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
