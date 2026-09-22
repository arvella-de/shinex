import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";

export const metadata = {
  title: "Contact us | Shinex Car Wash",
};

const hours = [
  { day: "Monday – Friday", time: "7:00 AM – 7:00 PM" },
  { day: "Saturday", time: "7:00 AM – 7:00 PM" },
  { day: "Sunday", time: "8:00 AM – 6:00 PM" },
];

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="bg-cream">
        <section className="border-b border-black/5 bg-ink py-14 text-cream">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              We&apos;re nearby
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              Get in touch
            </h1>
          </div>
        </section>

        <section className="py-14">
          <div className="container-shx grid gap-12 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="grid gap-6 sm:grid-cols-2">
                <InfoCard title="Location">
                  Ngong Road, opposite Adams Arcade
                  <br />
                  Nairobi, Kenya
                </InfoCard>
                <InfoCard title="Phone">
                  <a href="tel:+254712345678" className="focus-ring">
                    +254 712 345 678
                  </a>
                </InfoCard>
                <InfoCard title="Email">
                  <a href="mailto:hello@shinex.co.ke" className="focus-ring">
                    hello@shinex.co.ke
                  </a>
                </InfoCard>
                <InfoCard title="Opening hours">
                  <ul className="space-y-1">
                    {hours.map((h) => (
                      <li key={h.day} className="flex justify-between gap-4">
                        <span>{h.day}</span>
                        <span className="text-slate">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </InfoCard>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-black/10">
                <iframe
                  title="Shinex location map"
                  className="h-72 w-full"
                  loading="lazy"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=36.7766%2C-1.3020%2C36.7966%2C-1.2870&layer=mapnik&marker=-1.2945%2C36.7866"
                />
              </div>
            </div>

            <div>
              <div className="rounded-2xl border border-black/10 bg-paper p-7">
                <h2 className="font-display text-xl font-semibold text-ink">
                  Send us a message
                </h2>
                <p className="mt-1.5 font-body text-sm text-slate">
                  For questions, feedback, or fleet enquiries. We reply
                  within a day.
                </p>
                <ContactForm />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-black/10 bg-paper p-6">
      <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-teal-deep">
        {title}
      </h3>
      <div className="mt-2 font-body text-[15px] leading-relaxed text-ink">
        {children}
      </div>
    </div>
  );
}
