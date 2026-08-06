import { MetadataRoute } from 'next';

const BASE_URL = 'https://arabyshanaya.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api', '/account', '/orders', '/checkout', '/cart', '/reset-password', '/order-success', '/wishlist'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
