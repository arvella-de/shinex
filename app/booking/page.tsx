import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { readDB } from "@/lib/db";
import BookingForm from "./BookingForm";

export const metadata = {
  title: "Book a wash | Shinex Car Wash",
};

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const db = readDB();
  const services = db.services.filter((s) => s.active);

  return (
    <>
      <Navbar />
      <main className="bg-cream">
        <section className="border-b border-black/5 bg-ink py-14 text-cream">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              Step-by-step, takes under a minute
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              Book your wash
            </h1>
          </div>
        </section>

        <section className="py-14">
          <div className="container-shx">
            <BookingForm
              services={services}
              preselectedServiceId={service}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
