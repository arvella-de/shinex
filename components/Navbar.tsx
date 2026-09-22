import Link from "next/link";
import Logo from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-cream/90 backdrop-blur">
      <div className="container-shx flex h-16 items-center justify-between">
        <Link href="/" className="focus-ring rounded-sm">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring rounded-sm font-body text-[15px] text-ink/80 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="focus-ring hidden rounded-sm font-body text-sm text-ink/60 hover:text-ink sm:block"
          >
            Admin
          </Link>
          <Link
            href="/booking"
            className="focus-ring rounded-full bg-ink px-5 py-2.5 font-body text-sm font-medium text-cream transition-colors hover:bg-teal-deep"
          >
            Book now
          </Link>
        </div>
      </div>
    </header>
  );
}
