"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export interface ProductDisplayItem {
  src: string;
  name: string;
  price: number;
  href: string;
}

function DisplayCard({
  src,
  name,
  price,
  href,
  className,
}: ProductDisplayItem & { className?: string }) {
  return (
    <Link href={href} className="block">
      <div
        className={cn(
          "relative flex h-[400px] w-[260px] -skew-y-[8deg] select-none overflow-hidden",
          "border border-[#C5A059]/30 transition-all duration-700",
          "after:absolute after:-right-1 after:top-[-5%] after:h-[110%] after:w-[220px]",
          "after:bg-gradient-to-l after:from-[#f9f9f9] after:to-transparent after:content-['']",
          "hover:border-[#C5A059]/70 hover:shadow-xl",
          className
        )}
      >
        {/* Product image */}
        <img
          src={src}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ display: "block" }}
        />

        {/* Bottom info — always visible, skew corrected */}
        <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-4 pb-4 pt-10 skew-y-[8deg]">
          <p className="text-white text-[10px] tracking-[0.25em] uppercase leading-tight">
            {name}
          </p>
          <p className="text-[#C5A059] text-[11px] mt-1">
            ₹{price.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function DisplayCards({ products }: { products: ProductDisplayItem[] }) {
  if (!products || products.length < 3) return null;

  return (
    <div className="grid [grid-template-areas:'stack'] place-items-center opacity-100 animate-in fade-in-0 duration-700">
      {/* Back card — furthest offset, sits lowest in visual stack */}
      <DisplayCard
        {...products[2]}
        className={cn(
          "[grid-area:stack] translate-x-32 translate-y-20 hover:translate-y-10",
          "before:absolute before:w-full before:h-full before:content-['']",
          "before:bg-black/40 before:left-0 before:top-0",
          "before:transition-opacity before:duration-700",
          "grayscale-[80%] hover:before:opacity-0 hover:grayscale-0"
        )}
      />
      {/* Middle card */}
      <DisplayCard
        {...products[1]}
        className={cn(
          "[grid-area:stack] translate-x-16 translate-y-10 hover:-translate-y-1",
          "before:absolute before:w-full before:h-full before:content-['']",
          "before:bg-black/40 before:left-0 before:top-0",
          "before:transition-opacity before:duration-700",
          "grayscale-[80%] hover:before:opacity-0 hover:grayscale-0"
        )}
      />
      {/* Front card — no offset, pops up on hover */}
      <DisplayCard
        {...products[0]}
        className={cn(
          "[grid-area:stack] hover:-translate-y-10",
          "before:absolute before:w-full before:h-full before:content-['']",
          "before:bg-black/40 before:left-0 before:top-0",
          "before:transition-opacity before:duration-700",
          "grayscale-[80%] hover:before:opacity-0 hover:grayscale-0"
        )}
      />
    </div>
  );
}
