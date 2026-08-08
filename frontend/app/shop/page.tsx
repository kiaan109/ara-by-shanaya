import { Suspense } from 'react';
import { getAllProducts } from '@/lib/catalog';
import ShopClient from './ShopClient';

export const revalidate = 300; // re-fetch the server-rendered catalog every 5 minutes

// Server-rendered first paint — gives Googlebot real product content instead of a loading skeleton
export default async function ShopPage() {
  const all = await getAllProducts();

  const facets = {
    collections: Array.from(new Set(all.map((p: any) => p.collection).filter(Boolean))),
    categories:  Array.from(new Set(all.map((p: any) => p.category).filter(Boolean))),
  };

  const sorted = [...all].sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const initialProducts = sorted.slice(0, 12);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-4 h-4 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ShopClient initialProducts={initialProducts} initialTotal={all.length} initialFacets={facets} />
    </Suspense>
  );
}
