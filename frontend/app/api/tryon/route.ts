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

    // ARA product images are all model shots → convert to base64 server-side
    // so Fashn.ai gets the full-res image, then tell it the photo type is "model"
    // so it knows to extract the garment (not just warp the whole model photo)
    let garmentData = garmentImage;
    if (typeof garmentImage === 'string' && garmentImage.startsWith('http')) {
      try {
        garmentData = await urlToBase64(garmentImage);
      } catch {
        // fall back to URL if fetch fails
      }
    }

    const res = await fetch(`${FASHN_BASE}/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FASHN_KEY}`,
      },
      body: JSON.stringify({
        model_name: 'tryon-v1.6',
        inputs: {
          model_image:        modelImage,
          garment_image:      garmentData,
          category,
          garment_photo_type: 'model',   // product images show a model wearing the garment
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
