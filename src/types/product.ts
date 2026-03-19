export type ProductSize = string;

export interface Product {
  _id: string;
  sku: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  sizes: ProductSize[];
  images: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInput {
  name: string;
  price: number;
  category: string;
  sizes: string[];
  images: string[];
  description?: string;
  featured?: boolean;
}
