import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">Contact</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              Have a question, feedback, or partnership enquiry? We&apos;d
              love to hear from you.
            </p>
          </div>
        </section>

        <section className="bg-paper py-12">
          <div className="container-shx grid gap-12 md:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">
                Contact information
              </h2>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="font-body text-xs font-medium text-slate">
                    Address
                  </p>
                  <p className="mt-1 font-body text-sm text-ink">
                    Ngong Road, Nairobi, Kenya
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs font-medium text-slate">
                    Phone
                  </p>
                  <p className="mt-1 font-body text-sm text-ink">
                    +254 712 345 678
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs font-medium text-slate">
                    Email
                  </p>
                  <p className="mt-1 font-body text-sm text-ink">
                    hello@shinex.co.ke
                  </p>
                </div>
                <div>
                  <p className="font-body text-xs font-medium text-slate">
                    Hours
                  </p>
                  <p className="mt-1 font-body text-sm text-ink">
                    Mon–Sat: 7 AM – 6 PM
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-black/5 bg-cream p-6">
              <ContactForm />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
