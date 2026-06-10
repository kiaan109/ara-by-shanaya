import { readdirSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

function listDir(subfolder: string): string[] {
  try {
    const dir = path.join(process.cwd(), 'public', subfolder);
    return readdirSync(dir)
      .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
      .sort()
      .map(f => `/${subfolder}/${f}`);
  } catch {
    return [];
  }
}

export async function GET() {
  const products = listDir('products');
  const lookbook = listDir('lookbook');
  return NextResponse.json({ products, lookbook });
}
