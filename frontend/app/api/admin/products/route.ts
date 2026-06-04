import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/admin/products — fetch all admin-uploaded products
export async function GET() {
  const { data, error } = await supabase
    .from('admin_products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ products: data || [] });
}

// POST /api/admin/products — create new product with images
export async function POST(req: NextRequest) {
  const form = await req.formData();

  const name        = form.get('name') as string;
  const price       = parseInt(form.get('price') as string);
  const description = form.get('description') as string;
  const category    = form.get('category') as string;
  const collection  = form.get('collection') as string;
  const sizes       = (form.get('sizes') as string || '').split(',').map(s => s.trim()).filter(Boolean);
  const colors      = (form.get('colors') as string || '').split(',').map(s => s.trim()).filter(Boolean);
  const featured    = form.get('featured') === 'true';

  // Upload images to Supabase Storage
  const imageUrls: string[] = [];
  const files = form.getAll('images') as File[];

  for (const file of files) {
    if (!file || !file.size) continue;
    const ext      = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer   = Buffer.from(await file.arrayBuffer());

    const { error: uploadErr } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, { contentType: file.type, upsert: false });

    if (!uploadErr) {
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filename);
      imageUrls.push(publicUrl);
    }
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const { data, error } = await supabase
    .from('admin_products')
    .insert({
      _id:         `admin-${slug}-${Date.now()}`,
      name, price, description, category, collection,
      sizes, colors, featured,
      images:  imageUrls,
      in_stock: true,
      stock:   10,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data });
}
