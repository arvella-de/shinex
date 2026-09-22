import { readDB } from "@/lib/db";
import ServicesManager from "./ServicesManager";

export const metadata = { title: "Manage services | Shinex Admin" };

export default async function ManageServicesPage() {
  const db = readDB();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink md:text-3xl">
        Manage services
      </h1>
      <p className="mt-1 font-body text-sm text-slate">
        Add new services, edit prices and durations, or pause a service
        temporarily.
      </p>
      <div className="mt-8">
        <ServicesManager initialServices={db.services} />
      </div>
    </div>
  );
}
