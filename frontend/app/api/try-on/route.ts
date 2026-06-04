import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { localProducts } from '@/lib/localProducts';

const API_KEY  = process.env.AILABTOOLS_API_KEY || '';
const TRYON    = 'https://www.ailabapi.com/api/portrait/editing/try-on-clothes-pro';
const POLL_URL = 'https://www.ailabapi.com/api/common/query-async-task-result';

function isBottomGarment(category: string) {
  return category === 'Skirt';
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'AILABTOOLS_API_KEY not set in .env.local' }, { status: 500 });
  }

  const { userPhotoBase64, productId } = await req.json();
  if (!userPhotoBase64 || !productId) {
    return NextResponse.json({ error: 'Missing userPhotoBase64 or productId' }, { status: 400 });
  }

  const product = localProducts.find(p => p._id === productId);
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  const garmentPath = path.join(process.cwd(), 'public', product.images[0]);
  let garmentBuffer: Buffer;
  try { garmentBuffer = fs.readFileSync(garmentPath); }
  catch { return NextResponse.json({ error: 'Could not read garment image' }, { status: 500 }); }

  const b64Clean     = userPhotoBase64.replace(/^data:image\/\w+;base64,/, '');
  const personBuffer = Buffer.from(b64Clean, 'base64');

  // Build multipart form — Pro endpoint uses top_garment / bottom_garment
  const garmentBlob = new Blob([garmentBuffer], { type: 'image/jpeg' });
  const form = new FormData();
  form.append('task_type',    'async');
  form.append('person_image', new Blob([personBuffer], { type: 'image/jpeg' }), 'person.jpg');
  form.append('resolution',   '1280');       // highest quality output
  form.append('restore_face', 'true');       // preserve the person's face

  if (isBottomGarment(product.category)) {
    form.append('bottom_garment', garmentBlob, 'garment.jpg');
  } else {
    // Tops, Blazers, Dresses, Sets → top_garment
    form.append('top_garment', garmentBlob, 'garment.jpg');
  }

  // Submit job
  const submitRes  = await fetch(TRYON, {
    method: 'POST',
    headers: { 'ailabapi-api-key': API_KEY },
    body: form,
  });

  const rawText = await submitRes.text();
  console.log('[try-on] status:', submitRes.status, 'body:', rawText);

  let submitData: any;
  try { submitData = JSON.parse(rawText); }
  catch { return NextResponse.json({ error: `Non-JSON response (${submitRes.status}): ${rawText}` }, { status: 500 }); }

  if (!submitRes.ok || submitData.error_code !== 0) {
    return NextResponse.json({ error: submitData?.error_msg || `API error ${submitRes.status}` }, { status: 500 });
  }

  const taskId: string = submitData.task_id;

  // Poll up to 90 s (36 × 2.5 s)
  for (let i = 0; i < 36; i++) {
    await new Promise(r => setTimeout(r, 2500));

    const pollRes  = await fetch(`${POLL_URL}?task_id=${taskId}`, {
      headers: { 'ailabapi-api-key': API_KEY },
    });
    const pollRaw  = await pollRes.text();
    console.log(`[try-on] poll ${i + 1}:`, pollRaw.slice(0, 200));

    let pollData: any;
    try { pollData = JSON.parse(pollRaw); }
    catch {
      // Empty or non-JSON body — task probably still queued, keep polling
      continue;
    }

    // task_status: 0 = queued, 1 = processing, 2 = complete
    if (pollData.task_status === 2) {
      const imageUrl = pollData?.data?.image_url || pollData?.data?.image || pollData?.output?.image_url;
      if (!imageUrl) return NextResponse.json({ error: 'No image in completed response', raw: pollData }, { status: 500 });
      return NextResponse.json({ output: imageUrl });
    }

    if (pollData.error_code && pollData.error_code !== 0) {
      return NextResponse.json({ error: pollData?.error_msg || 'Generation failed', raw: pollData }, { status: 500 });
    }
    // status 0 or 1 — still running, keep polling
  }

  return NextResponse.json({ error: 'Timed out after 90 s' }, { status: 504 });
}
