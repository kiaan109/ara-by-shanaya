import type { Metadata } from 'next';
import { getProduct } from '@/lib/catalog';

const SITE = 'https://arabyshanaya.com';

function absImg(img?: string): string {
  if (!img) return `${SITE}/logo.jpg`;
  return img.startsWith('http') ? img : `${SITE}${img.startsWith('/') ? '' : '/'}${img}`;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProduct(params.id);
  if (!product) {
    return { title: 'Product Not Found', robots: { index: false } };
  }

  const title = `${product.name} — ${product.category || 'Fashion'}`;
  const description = (product.description || `${product.name} from the ${product.collection || "SS '26"} collection by ARA by Shanaya.`)
    .slice(0, 160);

  return {
    title,
    description,
    alternates: { canonical: `/shop/${product._id}` },
    openGraph: {
      title: `${title} | ARA by Shanaya`,
      description,
      type: 'website',
      url: `${SITE}/shop/${product._id}`,
      siteName: 'ARA by Shanaya',
      images: [{ url: absImg(product.images?.[0]), width: 900, height: 1200, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ARA by Shanaya`,
      description,
      images: [absImg(product.images?.[0])],
    },
  };
}

export default async function ProductLayout({ children, params }: { children: React.ReactNode; params: { id: string } }) {
  const product = await getProduct(params.id);

  const jsonLd = product ? [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || undefined,
      image: (product.images || []).map(absImg),
      brand: { '@type': 'Brand', name: 'ARA by Shanaya' },
      category: product.category || undefined,
      offers: {
        '@type': 'Offer',
        url: `${SITE}/shop/${product._id}`,
        priceCurrency: 'INR',
        price: product.price,
        availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: { '@type': 'Organization', name: 'ARA by Shanaya' },
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
        { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE}/shop` },
        ...(product.collection ? [{ '@type': 'ListItem', position: 3, name: product.collection, item: `${SITE}/shop?collection=${encodeURIComponent(product.collection)}` }] : []),
        { '@type': 'ListItem', position: product.collection ? 4 : 3, name: product.name, item: `${SITE}/shop/${product._id}` },
      ],
    },
  ] : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {children}
    </>
  );
}
