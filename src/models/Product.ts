import mongoose, { Model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface ProductDocument {
  sku: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDocument>(
  {
    sku: { type: String, unique: true, default: () => `ARA-${uuidv4().slice(0, 8).toUpperCase()}` },
    slug: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    sizes: { type: [String], default: [] },
    images: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Product: Model<ProductDocument> =
  mongoose.models.Product || mongoose.model<ProductDocument>("Product", ProductSchema);
