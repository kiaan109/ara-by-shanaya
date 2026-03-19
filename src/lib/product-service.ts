import { connectToDatabase } from "@/lib/db";
import { mockProducts } from "@/lib/mock-data";
import { Product } from "@/models/Product";
import { Product as ProductType, ProductInput } from "@/types/product";
import { slugify } from "@/utils/format";

function toClientProduct(doc: unknown): ProductType {
  const raw = doc as {
    _id: unknown;
    sku: unknown;
    slug: unknown;
    name: unknown;
    description?: unknown;
    price: unknown;
    category: unknown;
    sizes?: unknown;
    images?: unknown;
    featured?: unknown;
    createdAt?: unknown;
    updatedAt?: unknown;
  };

  return {
    _id: String(raw._id),
    sku: String(raw.sku),
    slug: String(raw.slug),
    name: String(raw.name),
    description: String(raw.description ?? ""),
    price: Number(raw.price),
    category: String(raw.category),
    sizes: Array.isArray(raw.sizes) ? (raw.sizes as string[]) : [],
    images: Array.isArray(raw.images) ? (raw.images as string[]) : [],
    featured: Boolean(raw.featured),
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  };
}

export async function getProducts(filters?: {
  category?: string;
  size?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  if (!process.env.MONGODB_URI) {
    return mockProducts.filter((product) => {
      const categoryMatch = !filters?.category || product.category === filters.category;
      const sizeMatch = !filters?.size || product.sizes.includes(filters.size);
      const minPriceMatch = !filters?.minPrice || product.price >= filters.minPrice;
      const maxPriceMatch = !filters?.maxPrice || product.price <= filters.maxPrice;
      return categoryMatch && sizeMatch && minPriceMatch && maxPriceMatch;
    });
  }

  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters?.category) query.category = filters.category;
  if (filters?.size) query.sizes = filters.size;
  if (filters?.minPrice || filters?.maxPrice) {
    query.price = {
      ...(filters.minPrice ? { $gte: filters.minPrice } : {}),
      ...(filters.maxPrice ? { $lte: filters.maxPrice } : {}),
    };
  }

  const docs = await Product.find(query).sort({ createdAt: -1 }).lean();
  return docs.map((doc) => toClientProduct(doc));
}

export async function getProductBySlug(slug: string) {
  if (!process.env.MONGODB_URI) {
    return mockProducts.find((product) => product.slug === slug) ?? null;
  }
  await connectToDatabase();
  const doc = await Product.findOne({ slug }).lean();
  return doc ? toClientProduct(doc) : null;
}

export async function upsertProduct(payload: ProductInput) {
  if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB is required for create/update operations. Configure MONGODB_URI.");
  }
  await connectToDatabase();
  const slug = slugify(payload.name);
  const updated = await Product.findOneAndUpdate(
    { slug },
    { ...payload, slug },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return toClientProduct(updated);
}
