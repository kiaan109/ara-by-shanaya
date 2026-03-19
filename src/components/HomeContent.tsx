import Link from "next/link";
import { Product } from "@/types/product";
import { HeroSlider } from "@/components/HeroSlider";
import { ProductCard } from "@/components/ProductCard";

interface HomeContentProps {
  products: Product[];
}

const categories = ["Dresses", "Ethnic", "Casual"];

export function HomeContent({ products }: HomeContentProps) {
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <>
      <HeroSlider products={products} />
      <section className="ara-container mt-14">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Categories</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {categories.map((category) => (
            <Link
              href={`/shop?category=${encodeURIComponent(category)}`}
              key={category}
              className="rounded-2xl border border-[var(--ara-border)] bg-white p-7 text-center font-serif text-3xl transition hover:border-[var(--ara-gold)]"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <section className="ara-container mt-16 pb-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-5xl">Featured Outfits</h2>
          <Link href="/shop" className="text-sm uppercase tracking-[0.2em] text-[var(--ara-gold)]">
            View all
          </Link>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {(featured.length ? featured : products.slice(0, 6)).map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </div>
      </section>
    </>
  );
}
