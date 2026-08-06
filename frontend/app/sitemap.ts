import { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/catalog';

const BASE_URL = 'https://arabyshanaya.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: '',                 priority: 1.0, freq: 'weekly'  as const },
    { path: '/shop',            priority: 0.9, freq: 'daily'   as const },
    { path: '/collections',     priority: 0.8, freq: 'weekly'  as const },
    { path: '/about',           priority: 0.6, freq: 'monthly' as const },
    { path: '/contact',         priority: 0.6, freq: 'monthly' as const },
    { path: '/try-on',          priority: 0.7, freq: 'monthly' as const },
    { path: '/faq',             priority: 0.5, freq: 'monthly' as const },
    { path: '/shipping-policy', priority: 0.4, freq: 'monthly' as const },
    { path: '/refund-policy',   priority: 0.4, freq: 'monthly' as const },
    { path: '/sustainability',  priority: 0.4, freq: 'monthly' as const },
  ].map(({ path, priority, freq }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
  }));

  // Full live catalog — includes admin-added products, not just the local seed
  let products: any[] = [];
  try { products = await getAllProducts(); } catch { /* fall back to static only */ }

  const productRoutes = products.map(p => ({
    url: `${BASE_URL}/shop/${p._id}`,
    lastModified: p.createdAt ? new Date(p.createdAt) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...productRoutes];
}
