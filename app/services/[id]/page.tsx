import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getApprovedReviews, getService } from "@/lib/supabase";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getService(id);

  if (!service) notFound();

  const serviceReviews = (await getApprovedReviews()).filter(
    (r) => r.serviceId === service.id
  );

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <Link
              href="/services"
              className="focus-ring font-body text-sm font-medium text-teal-deep underline decoration-teal-light underline-offset-4"
            >
              &larr; All services
            </Link>
            <p className="mt-4 rounded-full bg-teal-light/20 px-3 py-1 font-body text-xs font-medium text-teal-deep w-fit">
              {service.category}
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
              {service.name}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              {service.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <span className="font-body text-sm text-slate">
                {service.durationMinutes} minutes
              </span>
              <span className="text-ink/20">·</span>
              <span className="font-body text-sm font-semibold text-ink">
                KES {service.price}
              </span>
            </div>
            <Link
              href={`/booking?service=${service.id}`}
              className="focus-ring mt-8 inline-block rounded-full bg-amber px-7 py-3.5 font-body text-base font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              Book this service
            </Link>
          </div>
        </section>

        {service.longDescription && (
          <section className="bg-paper py-12">
            <div className="container-shx max-w-2xl">
              <h2 className="font-display text-xl font-semibold text-ink">
                About this service
              </h2>
              <div className="mt-4 whitespace-pre-line font-body text-[15px] leading-relaxed text-slate">
                {service.longDescription}
              </div>
            </div>
          </section>
        )}

        {serviceReviews.length > 0 && (
          <section className="bg-cream py-12">
            <div className="container-shx max-w-2xl">
              <h2 className="font-display text-xl font-semibold text-ink">
                Reviews for this service
              </h2>
              <div className="mt-6 space-y-5">
                {serviceReviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-black/5 bg-paper p-5"
                  >
                    <span className="font-body text-sm text-amber-dim">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    {r.title && (
                      <p className="mt-1.5 font-display text-sm font-semibold text-ink">
                        {r.title}
                      </p>
                    )}
                    <p className="mt-1 font-body text-sm leading-relaxed text-slate">
                      {r.comment}
                    </p>
                    <p className="mt-2 font-body text-xs text-slate">
                      — {r.customerName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
