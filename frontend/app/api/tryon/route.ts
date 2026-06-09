import { NextRequest, NextResponse } from 'next/server';

const FASHN_KEY  = process.env.FASHN_API_KEY;
const FASHN_BASE = 'https://api.fashn.ai/v1';

// Fetch a URL and return as base64 data URL so Fashn.ai always gets the full image
async function urlToBase64(url: string): Promise<string> {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Failed to fetch garment image: ${r.status}`);
  const buf = await r.arrayBuffer();
  const ct  = r.headers.get('content-type') || 'image/jpeg';
  const b64 = Buffer.from(buf).toString('base64');
  return `data:${ct};base64,${b64}`;
}

// POST /api/tryon — kick off Fashn.ai prediction, return id immediately
export async function POST(req: NextRequest) {
  if (!FASHN_KEY) {
    return NextResponse.json({ error: 'Try-on not configured' }, { status: 503 });
  }
  try {
    const { modelImage, garmentImage, category = 'one-pieces' } = await req.json();

    // Fetch garment server-side so Fashn.ai gets full-res image data
    let garmentData = garmentImage;
    if (typeof garmentImage === 'string' && garmentImage.startsWith('http')) {
      try {
        garmentData = await urlToBase64(garmentImage);
      } catch {
        // fall back to URL if fetch fails
      }
    }

    // Build a prompt so tryon-max fully replaces the original clothing
    // (without this, original pants/shirts can bleed through underneath)
    const promptMap: Record<string, string> = {
      'tops':
        'Completely replace the top/shirt with this garment. Keep the original pants/bottoms.',
      'bottoms':
        'Completely replace the pants/skirt/shorts with this garment. Remove the original bottoms entirely so none are visible.',
      'one-pieces':
        'Replace the entire outfit — top AND pants/skirt — with this garment. ' +
        'Remove all original clothing so no original pants or shirt are visible underneath.',
    };
    const tryonPrompt = promptMap[category] ?? promptMap['one-pieces'];

    // tryon-max = Fashn.ai's best model (enhanced fidelity, recommended endpoint)
    const res = await fetch(`${FASHN_BASE}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FASHN_KEY}`,
      },
      body: JSON.stringify({
        model_name: 'tryon-max',
        inputs: {
          model_image:     modelImage,
          product_image:   garmentData,
          generation_mode: 'quality',
          resolution:      '2k',
          prompt:          tryonPrompt,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: data.error || data.message || 'Fashn.ai error' }, { status: res.status });
    }
    return NextResponse.json({ predictionId: data.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// GET /api/tryon?id=xxx — poll Fashn.ai for job status
export async function GET(req: NextRequest) {
  if (!FASHN_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const res = await fetch(`${FASHN_BASE}/status/${id}`, {
      headers: { Authorization: `Bearer ${FASHN_KEY}` },
      cache: 'no-store',
    });
    const data = await res.json();

    const status =
      data.status === 'completed' ? 'completed' :
      data.status === 'failed'    ? 'failed'    : 'processing';

    // error may be an object {name, message} or a string
    const errorMsg =
      data.error?.message ?? (typeof data.error === 'string' ? data.error : null);

    return NextResponse.json({
      status,
      output: data.output ?? null,
      error:  errorMsg,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
