import { NextRequest, NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

const SETTINGS_BLOB = 'ara-settings.json';

async function readSettings(): Promise<Record<string, any>> {
  try {
    const { blobs } = await list({ prefix: SETTINGS_BLOB, limit: 1 });
    const b = blobs.find(x => x.pathname === SETTINGS_BLOB);
    if (!b) return {};
    const r = await fetch(b.url, { cache: 'no-store' });
    if (!r.ok) return {};
    return await r.json();
  } catch {
    return {};
  }
}

async function writeSettings(data: Record<string, any>) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  await put(SETTINGS_BLOB, blob, {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

// POST /api/admin/logo  — upload a logo image, store URL in settings
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('logo') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Only allow image types
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Max 5 MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 5 MB' }, { status: 400 });
    }

    // Derive extension from mime type
    const ext = file.type === 'image/png' ? 'png'
              : file.type === 'image/svg+xml' ? 'svg'
              : file.type === 'image/webp' ? 'webp'
              : 'png';

    // Upload to Vercel Blob — use a fixed pathname so it's always overwritten
    const { url } = await put(`ara-logo.${ext}`, file, {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // Persist URL in settings
    const current = await readSettings();
    await writeSettings({ ...current, logoUrl: url });

    return NextResponse.json({ logoUrl: url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE /api/admin/logo  — remove logo URL from settings
export async function DELETE() {
  try {
    const current = await readSettings();
    const { logoUrl: _removed, ...rest } = current;
    await writeSettings(rest);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
