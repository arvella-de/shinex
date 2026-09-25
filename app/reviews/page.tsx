import { getApprovedReviews, getServices } from "@/lib/supabase";
import ReviewsPageClient from "./ReviewsPageClient";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  const services = (await getServices()).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <ReviewsPageClient initialReviews={reviews} services={services} />
  );
}
