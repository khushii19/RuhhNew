import type { Metadata } from "next";
import { getApprovedReviews, getSettings } from "@/lib/data";
import { ReviewsView } from "@/components/views/reviews-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([getApprovedReviews(50), getSettings()]);
  return <ReviewsView reviews={reviews} settings={settings} />;
}
