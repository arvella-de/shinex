import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getAbout } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const about = await getAbout();

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              About Shinex
            </p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              {about.heroTitle}
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              {about.heroSubtitle}
            </p>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-paper py-16">
          <div className="container-shx">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Our Mission
            </h2>
            <p className="mt-4 max-w-2xl font-body text-[17px] leading-relaxed text-slate">
              {about.mission}
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-cream py-16">
          <div className="container-shx">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Our Values
            </h2>
            <p className="mt-2 max-w-lg font-body text-sm text-slate">
              The principles that guide how we work and serve our customers
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {about.values.map((value, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-black/5 bg-paper p-6"
                >
                  <span className="font-display text-2xl font-semibold text-amber-dim">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {value.title}
                  </h3>
                  <p className="mt-1.5 font-body text-sm leading-relaxed text-slate">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-paper py-16">
          <div className="container-shx">
            <h2 className="font-display text-3xl font-semibold text-ink">
              Why Choose Shinex
            </h2>
            <ul className="mt-6 max-w-2xl space-y-3">
              {about.whyChooseUs.map((item, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-body text-[15px] leading-relaxed text-slate"
                >
                  <span className="shrink-0 font-semibold text-teal-deep">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-teal-deep py-16 text-cream">
          <div className="container-shx flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                Ready to try Shinex?
              </h2>
              <p className="mt-2 max-w-md font-body text-teal-light/90">
                Book your first appointment and see why drivers trust us
                with their vehicles.
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
