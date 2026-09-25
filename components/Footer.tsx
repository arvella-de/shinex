import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="container-shx grid gap-10 py-14 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Logo dark />
          <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-cream/60">
            Nairobi&apos;s professional car wash booking service. Pick a slot,
            leave the car, come back to a clean one.
          </p>
        </div>
        <div>
          <h3 className="font-display text-sm font-medium text-cream/90">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 font-body text-sm text-cream/60">
            <li>
              <Link href="/services" className="focus-ring hover:text-cream">
                Services &amp; pricing
              </Link>
            </li>
            <li>
              <Link href="/about" className="focus-ring hover:text-cream">
                About us
              </Link>
            </li>
            <li>
              <Link href="/booking" className="focus-ring hover:text-cream">
                Book a wash
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-medium text-cream/90">
            Learn
          </h3>
          <ul className="mt-4 space-y-2 font-body text-sm text-cream/60">
            <li>
              <Link href="/blog" className="focus-ring hover:text-cream">
                Blog
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="focus-ring hover:text-cream">
                Reviews
              </Link>
            </li>
            <li>
              <Link href="/faq" className="focus-ring hover:text-cream">
                FAQ
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-sm font-medium text-cream/90">
            Contact
          </h3>
          <ul className="mt-4 space-y-2 font-body text-sm text-cream/60">
            <li>
              <Link href="/contact" className="focus-ring hover:text-cream">
                Contact us
              </Link>
            </li>
            <li>Ngong Road, Nairobi, Kenya</li>
            <li>+254 712 345 678</li>
            <li>hello@shinex.co.ke</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/10 py-5">
        <p className="container-shx font-body text-xs text-cream/40">
          &copy; {new Date().getFullYear()} Shinex Car Wash. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
