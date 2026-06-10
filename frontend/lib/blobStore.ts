import { put, list } from '@vercel/blob';

export async function readBlob<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const b = blobs.find(x => x.pathname === pathname);
    if (!b) return fallback;
    const r = await fetch(b.url, { cache: 'no-store' });
    return r.ok ? await r.json() : fallback;
  } catch { return fallback; }
}

export async function writeBlob(pathname: string, data: any) {
  const b = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  await put(pathname, b, { access: 'public', addRandomSuffix: false, allowOverwrite: true });
}
