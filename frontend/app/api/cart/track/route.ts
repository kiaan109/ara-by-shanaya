import { NextRequest, NextResponse } from 'next/server';
import { readBlob, writeBlob } from '@/lib/blobStore';

const CARTS_BLOB = 'ara-carts.json';

// POST — upsert/clear an in-progress cart for abandoned-cart reminders
export async function POST(req: NextRequest) {
  try {
    const { email, phone, name, items } = await req.json();
    if (!email?.trim()) return NextResponse.json({ skipped: true });

    const carts: any[] = await readBlob(CARTS_BLOB, []);
    const cleanEmail = email.trim().toLowerCase();
    const idx = carts.findIndex(c => c.email === cleanEmail);

    if (!items || items.length === 0) {
      // Cart emptied / order placed — remove tracking entry
      if (idx >= 0) carts.splice(idx, 1);
      await writeBlob(CARTS_BLOB, carts);
      return NextResponse.json({ success: true });
    }

    const itemsKey = JSON.stringify(items.map((i: any) => `${i._id}:${i.size || ''}:${i.quantity}`));
    const existing = carts[idx];
    const changed = !existing || existing.itemsKey !== itemsKey;

    const entry = {
      email: cleanEmail,
      phone: phone || existing?.phone || '',
      name:  name  || existing?.name  || '',
      items,
      itemsKey,
      updatedAt: changed ? new Date().toISOString() : (existing?.updatedAt || new Date().toISOString()),
      reminded: changed ? false : (existing?.reminded || false),
    };

    if (idx >= 0) carts[idx] = entry; else carts.unshift(entry);
    await writeBlob(CARTS_BLOB, carts);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
