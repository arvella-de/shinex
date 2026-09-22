export type VehicleType =
  | "Hatchback"
  | "Sedan"
  | "SUV"
  | "Pick-up"
  | "Van / Minibus"
  | "Luxury / Executive";

export type ServiceRecord = {
  id: string;
  name: string;
  description: string;
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
  serviceId: string;
  serviceName: string;
  price: number;
  date: string;
  time: string;
  status: BookingStatus;
  createdAt: string;
};

export type DB = {
  services: ServiceRecord[];
  bookings: BookingRecord[];
  admin: { username: string; password: string };
};
