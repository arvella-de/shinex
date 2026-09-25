import { getServerSupabase } from "./auth";
import { anon } from "./supabase-client";
import type {
  AboutContent,
  BlogPost,
  BookingRecord,
  FAQ,
  NotificationRecord,
  NotificationType,
  Review,
  ServiceCategory,
  ServiceRecord,
  VehicleType,
} from "./types";

// ---------------------------------------------------------------------------
// Row shapes (snake_case, as stored in Supabase)
// ---------------------------------------------------------------------------

type ServiceRow = {
  id: string;
  name: string;
  description: string;
  long_description: string | null;
  category: ServiceCategory;
  price: number;
  duration_minutes: number;
  active: boolean;
  sort_order: number;
  created_at: string;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  author: string;
  tag: string;
  reading_time: string;
  published_at: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
};

type ReviewRow = {
  id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  comment: string;
  service_id: string | null;
  service_name: string | null;
  approved: boolean;
  created_at: string;
};

type AboutRow = {
  id: number;
  hero_title: string;
  hero_subtitle: string;
  story: string;
  mission: string;
  values: { title: string; description: string }[];
  why_choose_us: string[];
  updated_at: string;
};

export type BookingRow = {
  id: string;
  ref: string;
  customer_name: string;
  phone: string;
  vehicle_type: string;
  reg_number: string;
  service_ids: string[];
  service_names: string[];
  price: number;
  date: string;
  time_slot: string;
  status: BookingRecord["status"];
  created_at: string;
};

type NotificationRow = {
  id: number;
  type: NotificationType;
  message: string;
  ref: string | null;
  read: boolean;
  created_at: string;
};

// ---------------------------------------------------------------------------
// Mappers (snake_case DB -> camelCase app types)
// ---------------------------------------------------------------------------

export function mapService(row: ServiceRow): ServiceRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    longDescription: row.long_description ?? "",
    category: row.category,
    price: row.price,
    durationMinutes: row.duration_minutes,
    active: row.active,
  };
}

export function mapBlogPost(row: BlogRow): BlogPost {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt ?? "",
    content: row.content,
    author: row.author,
    tag: row.tag,
    readingTime: row.reading_time,
    publishedAt: row.published_at,
  };
}

export function mapFaq(row: FaqRow): FAQ {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    category: row.category,
    order: row.sort_order,
  };
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    customerName: row.customer_name,
    rating: row.rating,
    title: row.title ?? "",
    comment: row.comment,
    serviceId: row.service_id ?? "",
    serviceName: row.service_name ?? "",
    approved: row.approved,
    createdAt: row.created_at,
  };
}

export function mapAbout(row: AboutRow): AboutContent {
  return {
    heroTitle: row.hero_title,
    heroSubtitle: row.hero_subtitle,
    story: row.story,
    mission: row.mission,
    values: row.values,
    whyChooseUs: row.why_choose_us,
  };
}

export function mapBooking(row: BookingRow): BookingRecord {
  return {
    id: row.id,
    ref: row.ref,
    customerName: row.customer_name,
    phone: row.phone,
    vehicleType: row.vehicle_type as VehicleType,
    regNumber: row.reg_number,
    serviceIds: row.service_ids,
    serviceNames: row.service_names,
    price: row.price,
    date: row.date,
    time: row.time_slot,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    type: row.type,
    message: row.message,
    ref: row.ref ?? "",
    read: row.read,
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

export async function getServices(): Promise<ServiceRecord[]> {
  const { data, error } = await anon
    .from("services")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(`Failed to load services: ${error.message}`);
  return (data ?? []).map((row: ServiceRow) => mapService(row));
}

export async function getService(id: string): Promise<ServiceRecord | null> {
  const { data, error } = await anon
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to load service: ${error.message}`);
  return data ? mapService(data as ServiceRow) : null;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await anon
    .from("blog")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`Failed to load blog posts: ${error.message}`);
  return (data ?? []).map((row: BlogRow) => mapBlogPost(row));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await anon
    .from("blog")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`Failed to load blog post: ${error.message}`);
  return data ? mapBlogPost(data as BlogRow) : null;
}

export async function getFAQs(): Promise<FAQ[]> {
  const { data, error } = await anon
    .from("faqs")
    .select("*")
    .order("sort_order");
  if (error) throw new Error(`Failed to load FAQs: ${error.message}`);
  return (data ?? []).map((row: FaqRow) => mapFaq(row));
}

export async function getAbout(): Promise<AboutContent> {
  const { data, error } = await anon
    .from("about")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error(`Failed to load about content: ${error.message}`);
  return mapAbout(data as AboutRow);
}

export async function getApprovedReviews(): Promise<Review[]> {
  const { data, error } = await anon
    .from("reviews")
    .select("*")
    .eq("approved", true)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load reviews: ${error.message}`);
  return (data ?? []).map((row: ReviewRow) => mapReview(row));
}

export async function getBookings(): Promise<BookingRecord[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Failed to load bookings: ${error.message}`);
  return (data ?? []).map((row: BookingRow) => mapBooking(row));
}

export async function getBookingByRef(
  ref: string
): Promise<BookingRecord | null> {
  const { data, error } = await anon.rpc("get_booking_by_ref", { p_ref: ref });
  if (error) throw new Error(`Failed to load booking: ${error.message}`);
  if (!data) return null;
  return mapBooking(data as BookingRow);
}

export async function getActiveServicesByIds(
  ids: string[]
): Promise<ServiceRecord[]> {
  if (ids.length === 0) return [];
  const { data, error } = await anon
    .from("services")
    .select("*")
    .in("id", ids);
  if (error) throw new Error(`Failed to load services: ${error.message}`);
  return (data ?? [])
    .map((row: ServiceRow) => mapService(row))
    .filter((s) => s.active);
}

export async function getNotifications(
  limit = 10
): Promise<NotificationRecord[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Failed to load notifications: ${error.message}`);
  return (data ?? []).map((row: NotificationRow) => mapNotification(row));
}

export async function addBookingNotification(
  type: NotificationType,
  ref: string,
  message: string
): Promise<void> {
  try {
    await anon.rpc("add_notification", {
      p_type: type,
      p_message: message,
      p_ref: ref,
    });
  } catch (err) {
    console.error("Failed to record notification:", err);
  }
}