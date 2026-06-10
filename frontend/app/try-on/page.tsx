'use client';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

function TryOnContent() {
  const params = useSearchParams();
  const preProductId = params.get('product');

  // step 0 = choose style, step 1 = upload photo, step 2 = result
  const [step, setStep]           = useState<0 | 1 | 2>(0);
  const [modelImg, setModelImg]   = useState<string | null>(null);
  const [preview, setPreview]     = useState<string | null>(null);
  const [products, setProducts]   = useState<any[]>([]);
  const [selected, setSelected]   = useState<any | null>(null);
  const [loading, setLoading]     = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [result, setResult]       = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/products?limit=50')
      .then(r => r.json())
      .then(d => {
        const prods: any[] = d.products || [];
        setProducts(prods);
        if (preProductId) {
          const found = prods.find(p => p._id === preProductId);
          if (found) { setSelected(found); setStep(1); }
        }
      })
      .catch(() => {});
  }, [preProductId]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('Max 10 MB'); return; }
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target?.result as string;
      setModelImg(b64);
      setPreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const startPolling = (id: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      if (++attempts > 72) {
        clearInterval(pollRef.current!);
        setLoading(false);
        toast.error('Timed out — please try again');
        return;
      }
      try {
        const r = await fetch(`/api/tryon?id=${id}`);
        const d = await r.json();
        if (d.status === 'completed' && d.output?.[0]) {
          clearInterval(pollRef.current!);
          setResult(d.output[0]);
          setLoading(false);
          setStep(2);
        } else if (d.status === 'failed') {
          clearInterval(pollRef.current!);
          setLoading(false);
          toast.error(d.error || 'Try-on failed — try a different photo');
        } else {
          setStatusMsg('Generating your look…');
        }
      } catch { /* retry next tick */ }
    }, 5000);
  };

  const handleTryOn = async () => {
    if (!modelImg) { toast.error('Upload your photo first'); return; }
    if (!selected) { toast.error('Select a dress first'); return; }

    setLoading(true);
    setResult(null);
    setStatusMsg('Starting up…');

    try {
      const garmentUrl: string = selected.images?.[0] || '';
      const fullGarment = garmentUrl.startsWith('http')
        ? garmentUrl
        : `https://arabyshanaya.com${garmentUrl}`;

      // Determine garment category for Fashn.ai
      const nameLower = (selected.name || '').toLowerCase();
      const catLower  = (selected.category || '').toLowerCase();
      const category =
        (nameLower.includes('shirt') || nameLower.includes('top') || nameLower.includes('blouse') || catLower.includes('top'))
          ? 'tops'
          : (nameLower.includes('pant') || nameLower.includes('trouser') || nameLower.includes('skirt') || catLower.includes('bottom'))
          ? 'bottoms'
          : 'one-pieces';

      const r = await fetch('/api/tryon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelImage: modelImg, garmentImage: fullGarment, category }),
      });
      const d = await r.json();

      if (!r.ok || d.error) {
        toast.error(d.error || 'Failed to start try-on');
        setLoading(false);
        return;
      }
      startPolling(d.predictionId);
    } catch {
      toast.error('Network error — please try again');
      setLoading(false);
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStep(0); setModelImg(null); setPreview(null);
    setSelected(null); setResult(null); setLoading(false); setStatusMsg('');
  };

  const whatsappMsg = selected
    ? `Hi! I tried on the "${selected.name}" using the ARA Virtual Try-On and love it! Can you help me order? 🌸`
    : 'Hi! I need help with the ARA Virtual Try-On feature 🌸';

  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <Toaster position="top-center" />

      {/* ── Header ── */}
      <div className="bg-white border-b border-[#ebebeb] px-5 py-10 text-center">
        <h1 className="font-display text-[32px] md:text-[40px] font-light tracking-wide">Virtual Try-On</h1>
        <p className="text-[11px] text-[#aaa] mt-2 tracking-wider">See yourself in any ARA dress before you buy</p>
      </div>

      {/* ── Step pills ── */}
      <div className="flex items-center justify-center gap-2 py-6">
        {['Choose Style', 'Upload Photo', 'Your Look'].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full text-[9px] font-medium flex items-center justify-center transition-all ${
              i < step ? 'bg-[#C5A059] text-white' : i === step ? 'bg-black text-white' : 'border border-[#ddd] text-[#bbb]'
            }`}>{i < step ? '✓' : i + 1}</div>
            <span className={`text-[10px] tracking-[0.12em] uppercase hidden sm:block ${i === step ? 'text-black' : 'text-[#bbb]'}`}>{s}</span>
            {i < 2 && <div className="w-6 h-px bg-[#e0e0e0] ml-1" />}
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto px-5 pb-6">
        <AnimatePresence mode="wait">

          {/* ── Step 0: choose style ── */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-5">
              <p className="text-[11px] tracking-[0.2em] uppercase text-center text-[#888]">
                Choose the piece you want to try on. Our AI places it on your photo in seconds.
              </p>

              {products.filter(p => p.images?.length).length === 0 && (
                <p className="text-[12px] text-[#aaa] text-center py-12">Loading products…</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {products.filter(p => p.images?.length).map(p => (
                  <button key={p._id} onClick={() => { setSelected(p); setStep(1); }}
                    className="relative text-left border border-[#e8e8e8] hover:border-[#C5A059] transition-all group"
                  >
                    <div className="bg-[#f5f5f5]" style={{ aspectRatio: '3/4' }}>
                      <img src={p.images[0]} alt={p.name} className="w-full h-full object-contain group-hover:scale-[1.03] transition-transform duration-300" />
                    </div>
                    <div className="p-2">
                      <p className="text-[10px] truncate">{p.name}</p>
                      <p className="text-[10px] text-[#C5A059]">₹{p.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: upload photo ── */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="max-w-md mx-auto space-y-5">

              {/* Selected style preview */}
              {selected && (
                <div className="flex items-center gap-3 bg-white border border-[#ebebeb] p-3">
                  <img src={selected.images[0]} alt={selected.name} className="w-14 h-18 object-contain bg-[#f5f5f5]" style={{ height: '72px' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] tracking-[0.2em] uppercase text-[#C5A059] mb-0.5">Selected Style</p>
                    <p className="text-[12px] font-medium truncate">{selected.name}</p>
                    <p className="text-[11px] text-[#888]">₹{selected.price?.toLocaleString('en-IN')}</p>
                  </div>
                  <button onClick={() => setStep(0)}
                    className="text-[9px] tracking-[0.15em] uppercase text-[#999] hover:text-black transition-colors shrink-0">
                    Change
                  </button>
                </div>
              )}

              <div
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
                onDragOver={e => e.preventDefault()}
                onClick={() => fileRef.current?.click()}
                className={`border-2 border-dashed cursor-pointer transition-colors hover:border-[#C5A059] ${
                  preview ? 'border-[#C5A059] p-2' : 'border-[#ddd] p-14 text-center'
                }`}
              >
                {preview ? (
                  <div className="relative group">
                    <img src={preview} alt="You" className="w-full max-h-[420px] object-contain" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-[11px] tracking-[0.2em] uppercase">Change Photo</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-3">📸</div>
                    <p className="text-[12px] text-[#666]">Upload your photo</p>
                    <p className="text-[10px] text-[#bbb] mt-1">JPG or PNG · Any size</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

              <p className="text-[10px] text-[#999]">
                Upload a front-facing full-body photo for best results. A{' '}
                <span className="underline">plain background</span> works best.
              </p>

              <ul className="text-[10px] text-[#aaa] space-y-1">
                <li>· Front-facing, full-body photo works best</li>
                <li>· Plain or simple background preferred</li>
                <li>· Good lighting helps the AI</li>
              </ul>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex-1 border border-[#ddd] text-[10px] tracking-[0.2em] uppercase py-3.5 hover:border-black transition-colors">
                  ← Back
                </button>
                <button onClick={handleTryOn} disabled={!modelImg || loading}
                  className="flex-1 gold-btn text-white text-[10px] tracking-[0.15em] uppercase py-3.5 disabled:opacity-40 flex items-center justify-center gap-2">
                  {loading
                    ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />{statusMsg}</>
                    : 'Try It On ✨'
                  }
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: result ── */}
          {step === 2 && result && (
            <motion.div key="s2" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto space-y-6">
              <p className="text-center text-[10px] tracking-[0.4em] uppercase text-[#C5A059]">Your Look ✨</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-[#ebebeb] p-3">
                  <p className="text-[8px] tracking-[0.25em] uppercase text-[#bbb] text-center mb-2">Your Photo</p>
                  <img src={preview!} alt="Original" className="w-full max-h-[520px] object-contain" />
                </div>
                <div className="bg-white border border-[#ebebeb] p-3">
                  <p className="text-[8px] tracking-[0.25em] uppercase text-[#bbb] text-center mb-2">
                    Wearing {selected?.name}
                  </p>
                  <img src={result} alt="Try-on result" className="w-full max-h-[520px] object-contain" />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <a href={result} download={`ara-tryon-${Date.now()}.jpg`}
                  className="gold-btn text-white text-[10px] tracking-[0.2em] uppercase px-7 py-3.5">
                  ↓ Download Look
                </a>
                <Link
                  href={`/shop/${selected?._id}`}
                  className="bg-black text-white text-[10px] tracking-[0.2em] uppercase px-7 py-3.5 inline-flex items-center"
                >
                  Buy This Dress →
                </Link>
                <button onClick={() => { setResult(null); setStep(0); }}
                  className="border border-[#ddd] text-[10px] tracking-[0.2em] uppercase px-7 py-3.5 hover:border-black transition-colors">
                  Try Another Dress
                </button>
                <button onClick={reset}
                  className="border border-[#ddd] text-[10px] tracking-[0.2em] uppercase px-7 py-3.5 hover:border-black transition-colors">
                  Start Over
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Loading overlay ── */}
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white p-10 text-center w-72">
              <div className="relative w-14 h-14 mx-auto mb-5">
                <div className="absolute inset-0 rounded-full border-2 border-[#C5A059]/20" />
                <div className="absolute inset-0 rounded-full border-2 border-t-[#C5A059] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-xl">✨</div>
              </div>
              <p className="font-display text-[15px] font-light mb-1">Creating your look…</p>
              <p className="text-[10px] text-[#aaa] tracking-wider">{statusMsg}</p>
              <p className="text-[9px] text-[#ccc] mt-3">Usually 1–3 minutes</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Fixed bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] px-5 md:px-14 py-4 flex items-center justify-between z-20">
        <p className="text-[10px] text-[#aaa] tracking-[0.1em]">ARA Virtual Try-On · Powered by AI</p>
        <a
          href={`https://wa.me/918980008826?text=${encodeURIComponent(whatsappMsg)}`}
          target="_blank" rel="noopener noreferrer"
          className="text-[10px] tracking-[0.2em] uppercase hover:opacity-60 transition-opacity flex items-center gap-2"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Talk to a Stylist
        </a>
      </div>
    </div>
  );
}

export default function TryOnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-5 h-5 border border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <TryOnContent />
    </Suspense>
  );
}
