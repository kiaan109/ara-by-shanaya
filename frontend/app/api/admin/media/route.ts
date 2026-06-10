import { NextRequest, NextResponse } from 'next/server';
import { put, list, del } from '@vercel/blob';

const PREFIX = 'media/';

// GET /api/admin/media — list all uploaded media
export async function GET() {
  try {
    const { blobs } = await list({ prefix: PREFIX });
    const items = blobs
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .map(b => ({
        url: b.url,
        pathname: b.pathname,
        uploadedAt: b.uploadedAt,
        size: b.size,
      }));
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e.message });
  }
}

// POST /api/admin/media — upload a (cropped) photo
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 8 MB' }, { status: 400 });
    }

    const ext = file.type === 'image/png' ? 'png'
              : file.type === 'image/webp' ? 'webp'
              : 'jpg';

    const safeName = (file.name || 'photo')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()
      .slice(0, 40);

    const filename = `${PREFIX}${Date.now()}-${safeName || 'photo'}.${ext}`;

    const { url } = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/media — remove an uploaded photo
export async function DELETE(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: 'No url provided' }, { status: 400 });
    await del(url);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
