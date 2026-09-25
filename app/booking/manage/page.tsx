import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getServices } from "@/lib/supabase";
import ManageBooking from "./ManageBooking";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Manage your booking | Shinex Car Wash",
};

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; token?: string }>;
}) {
  const { ref, token } = await searchParams;
  const services = (await getServices()).filter((s) => s.active);

  return (
    <>
      <Navbar />
      <main className="bg-cream">
        <section className="border-b border-black/5 bg-ink py-14 text-cream">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">
              Need to change something?
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
              Manage your booking
            </h1>
          </div>
        </section>

        <section className="py-14">
          <div className="container-shx max-w-3xl">
            <ManageBooking
              services={services}
              initialRef={ref}
              initialToken={token}
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}