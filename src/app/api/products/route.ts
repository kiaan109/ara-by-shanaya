import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getProducts, upsertProduct } from "@/lib/product-service";

const productSchema = z.object({
  name: z.string().min(2),
  price: z.number().nonnegative(),
  category: z.string().min(2),
  sizes: z.array(z.string()).default([]),
  images: z.array(z.string().url()).min(1),
  description: z.string().optional(),
  featured: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;
    const size = searchParams.get("size") || undefined;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const products = await getProducts({
      category,
      size,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to fetch products." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const payload = productSchema.parse(body);
    const product = await upsertProduct(payload);
    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid product payload." },
      { status: 400 },
    );
  }
}
