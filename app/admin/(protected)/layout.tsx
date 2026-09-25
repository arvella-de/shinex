import { redirect } from "next/navigation";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/auth";
import Logo from "@/components/Logo";
import LogoutButton from "./LogoutButton";

const navLinks = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
];

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-cream md:grid md:grid-cols-[220px_1fr]">
      <aside className="flex flex-col justify-between border-b border-black/10 bg-ink p-6 text-cream md:min-h-screen md:border-b-0 md:border-r">
        <div>
          <Link href="/" className="focus-ring inline-block rounded-sm">
            <Logo dark />
          </Link>
          <nav className="mt-10 flex gap-2 md:flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-lg px-3 py-2 font-body text-sm text-cream/70 transition-colors hover:bg-cream/10 hover:text-cream"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <LogoutButton />
      </aside>
      <main className="p-6 md:p-10">{children}</main>
    </div>
  );
}
