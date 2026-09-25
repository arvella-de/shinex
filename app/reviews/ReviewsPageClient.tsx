"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ReviewForm from "./ReviewForm";

export default function ReviewsPageClient({
  initialReviews,
  services,
}: {
  initialReviews: Array<{
    id: string;
    rating: number;
    title?: string;
    comment: string;
    customerName: string;
    serviceName?: string;
    createdAt: string;
  }>;
  services: Array<{ id: string; name: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  function handleSuccess() {
    setShowForm(false);
    router.refresh();
  }

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <section className="bg-cream py-14 md:py-20">
          <div className="container-shx">
            <p className="font-body text-sm font-medium text-amber">Reviews</p>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight tracking-tight text-ink md:text-6xl">
              What Our Customers Say
            </h1>
            <p className="mt-4 max-w-xl font-body text-lg leading-relaxed text-slate">
              Real feedback from drivers who have booked with Shinex.
              We value every review and use it to improve our service.
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="focus-ring mt-6 rounded-full bg-amber px-6 py-3 font-body text-sm font-semibold text-ink transition-transform hover:scale-[1.02]"
            >
              {showForm ? "Cancel" : "Write a review"}
            </button>
          </div>
        </section>

        {/* Review Form */}
        {showForm && (
          <section className="border-t border-black/5 bg-paper py-10">
            <div className="container-shx max-w-lg">
              <ReviewForm
                services={services}
                onSuccess={handleSuccess}
              />
            </div>
          </section>
        )}

        {/* Reviews list */}
        <section className="bg-cream py-12">
          <div className="container-shx">
            {initialReviews.length === 0 ? (
              <p className="font-body text-sm text-slate">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {initialReviews.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-2xl border border-black/5 bg-paper p-6"
                  >
                    <span className="font-body text-sm text-amber-dim">
                      {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                    </span>
                    {r.title && (
                      <p className="mt-2 font-display text-base font-semibold text-ink">
                        {r.title}
                      </p>
                    )}
                    <p className="mt-2 font-body text-sm leading-relaxed text-slate">
                      {r.comment}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="font-body text-xs text-slate">
                        — {r.customerName}
                      </p>
                      {r.serviceName && (
                        <span className="rounded-full bg-teal-light/20 px-2 py-0.5 font-body text-[10px] font-medium text-teal-deep">
                          {r.serviceName}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-body text-[10px] text-slate/60">
                      {new Date(r.createdAt).toLocaleDateString("en-KE", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
