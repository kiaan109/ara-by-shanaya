import { MetadataRoute } from 'next';
import { localProducts } from '@/lib/localProducts';

const BASE_URL = 'https://arabyshanaya.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/shop',
    '/collections',
    '/about',
    '/contact',
    '/try-on',
  ].map(path => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.8,
  }));

  const productRoutes = localProducts.map(p => ({
    url: `${BASE_URL}/shop/${p._id}`,
    lastModified: new Date(p.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...productRoutes];
}
