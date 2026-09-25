export type VehicleType =
  | "Hatchback"
  | "Sedan"
  | "SUV"
  | "Pick-up"
  | "Van / Minibus"
  | "Luxury / Executive";

export type ServiceCategory =
  | "Exterior Cleaning"
  | "Interior Cleaning"
  | "Full Cleaning & Detailing"
  | "Paint & Protection"
  | "Specialized Services";

export type ServiceRecord = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: ServiceCategory;
  price: number;
  durationMinutes: number;
  active: boolean;
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type BookingRecord = {
  id: string;
  ref: string;
  customerName: string;
  phone: string;
  vehicleType: VehicleType;
  regNumber: string;
  serviceIds: string[];
  serviceNames: string[];
  price: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
};

export type NotificationType =
  | "new_booking"
  | "booking_updated"
  | "booking_cancelled";

export type NotificationRecord = {
  id: number;
  type: NotificationType;
  message: string;
  ref: string;
  read: boolean;
  createdAt: string;
};

export type Review = {
  id: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  serviceId: string;
  serviceName: string;
  approved: boolean;
  createdAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tag: string;
  publishedAt: string;
  readingTime: string;
};

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
};

export type AboutContent = {
  heroTitle: string;
  heroSubtitle: string;
  story: string;
  mission: string;
  values: { title: string; description: string }[];
  whyChooseUs: string[];
};
