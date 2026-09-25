import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getFAQs } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const faqs = await getFAQs();

  const categories = [...new Set(faqs.map((f) => f.category))];

  const grouped = categories.map((cat) => ({
    category: cat,
    items: faqs.filter((f) => f.category === cat),
  }));

  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">FAQ</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              Quick answers to the questions we hear most often.
            </p>
          </div>
        </section>

        <section className="bg-paper py-12">
          <div className="container-shx max-w-3xl">
            {grouped.map((group) => (
              <div key={group.category} className="mb-8">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {group.category}
                </h2>
                <div className="mt-3 divide-y divide-black/10 rounded-2xl border border-black/10 bg-cream">
                  {group.items.map((faq) => (
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
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-teal-deep py-16 text-cream">
          <div className="container-shx flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Still have questions?
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Get in touch or book a service to experience it yourself.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="focus-ring rounded-full border border-cream/25 px-6 py-3 font-body text-sm font-medium text-cream/90 hover:border-cream/50"
              >
                Contact us
              </Link>
              <Link
                href="/booking"
                className="focus-ring rounded-full bg-amber px-6 py-3 font-body text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
              >
                Book now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
