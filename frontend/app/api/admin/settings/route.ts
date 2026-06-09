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

export async function GET() {
  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const current = await readSettings();
    const updated = { ...current, ...body };
    await writeSettings(updated);
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
