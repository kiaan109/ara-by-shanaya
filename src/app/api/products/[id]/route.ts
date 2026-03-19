import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/db";
import { Product } from "@/models/Product";
import { slugify } from "@/utils/format";

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().nonnegative().optional(),
  category: z.string().optional(),
  sizes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  description: z.string().optional(),
  featured: z.boolean().optional(),
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const payload = patchSchema.parse(await request.json());
    const update = payload.name ? { ...payload, slug: slugify(payload.name) } : payload;

    const product = await Product.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Update failed." },
      { status: 400 },
    );
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    await connectToDatabase();
    const { id } = await params;
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Delete failed." },
      { status: 400 },
    );
  }
}
