"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/try-on", label: "AI Try-On" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/cart", label: "Cart" },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--ara-border)] bg-white/90 backdrop-blur">
      <div className="ara-container flex h-20 items-center justify-between">
        <Link href="/" className="font-serif text-4xl tracking-wide text-[var(--ara-gold)]">
          <Image src="/ara-logo.png" alt="ARA by Shanaya" width={150} height={58} priority className="h-14 w-auto" />
        </Link>
        <nav className="hidden gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "transition-colors hover:text-[var(--ara-gold)]",
                pathname === link.href ? "text-[var(--ara-gold)]" : "text-[var(--ara-muted)]",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
