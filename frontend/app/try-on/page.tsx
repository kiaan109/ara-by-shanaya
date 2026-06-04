'use client';
import { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const PRODUCTS = [
  { id: 'dark-cloud-corset-maxi',       name: 'Dark Cloud Corset Maxi',    img: '/products/dark-cloud-corset-maxi.jpg',       price: '₹15,500' },
  { id: 'horizon-scuba-maxi-cutout',    name: 'Horizon Scuba Maxi',        img: '/products/horizon-scuba-maxi-cutout.jpg',    price: '₹15,500' },
  { id: 'beach-mini-balloon-dress',     name: 'Beach Mini Balloon Dress',  img: '/products/beach-mini-balloon-dress.jpg',     price: '₹8,500'  },
  { id: 'waves-sun-dress',              name: 'Waves Sun Dress',           img: '/products/waves-sun-dress.jpg',              price: '₹7,500'  },
  { id: 'pink-skies-corset-top',        name: 'Pink Skies Corset Top',     img: '/products/pink-skies-corset-top.jpg',        price: '₹10,500' },
  { id: 'orange-vista-scuba-maxi',      name: 'Orange Vista Scuba Maxi',   img: '/products/orange-vista-scuba-maxi.jpg',      price: '₹15,500' },
];

type Step = 'select' | 'upload' | 'processing' | 'result';

const ease = [0.25, 0.1, 0.25, 1] as const;

export default function TryOnPage() {
  const [step,       setStep]       = useState<Step>('select');
  const [selected,   setSelected]   = useState<typeof PRODUCTS[0] | null>(null);
  const [userPhoto,  setUserPhoto]  = useState<string | null>(null);
  const [resultUrl,  setResultUrl]  = useState<string | null>(null);
  const [progress,   setProgress]   = useState(0);
  const [error,      setError]      = useState<string | null>(null);
  const fileRef  = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSelect = (p: typeof PRODUCTS[0]) => {
    setSelected(p);
    setStep('upload');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selected) return;

    setError(null);
    setUserPhoto(URL.createObjectURL(file));
    setStep('processing');
    setProgress(0);

    // Fake progress bar advancing to ~85% while API runs
    timerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 85) { clearInterval(timerRef.current!); return 85; }
        return p + Math.random() * 3;
      });
    }, 700);

    const reader = new FileReader();
    reader.onload = async ev => {
      const base64 = ev.target?.result as string;
      try {
        const res  = await fetch('/api/try-on', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userPhotoBase64: base64, productId: selected.id }),
        });
        const data = await res.json();
        clearInterval(timerRef.current!);

        if (data.output) {
          setProgress(100);
          setTimeout(() => { setResultUrl(data.output); setStep('result'); }, 400);
        } else {
          setError(data.error || 'AI generation failed. Please try again.');
          setStep('upload');
          setProgress(0);
        }
      } catch {
        clearInterval(timerRef.current!);
        setError('Could not reach the AI service. Please try again.');
        setStep('upload');
        setProgress(0);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    clearInterval(timerRef.current!);
    setStep('select'); setSelected(null); setUserPhoto(null);
    setResultUrl(null); setProgress(0); setError(null);
  };

  const waMsg = encodeURIComponent(
    selected
      ? `Hi! I tried on the "${selected.name}" using the ARA Virtual Try-On and love it! Can you help me order? 🌸`
      : `Hi! I'm interested in ARA Summer 2025 and need styling advice.`
  );

  const stepIdx = step === 'select' ? 0 : step === 'upload' ? 1 : 2;

  return (
    <div className="min-h-screen bg-white pb-20">

      {/* ── Header ── */}
      <div className="px-5 md:px-14 pt-10 pb-8 border-b border-[#e5e5e5]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.4em] uppercase text-[#767676] mb-1">Powered by Fashn AI</p>
            <h1 className="text-[26px] font-light tracking-[-0.02em]">Virtual Try-On</h1>
          </div>
          {step !== 'select' && (
            <button onClick={handleReset}
              className="text-[10px] tracking-[0.2em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2">
              Start Over
            </button>
          )}
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 max-w-xs">
          {['Choose Style', 'Upload Photo', 'Your Look'].map((label, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] transition-all duration-300 ${
                  i <= stepIdx ? 'bg-black text-white' : 'bg-[#e5e5e5] text-[#999]'
                }`}>{i + 1}</div>
                <span className="text-[9px] tracking-[0.1em] uppercase mt-1 text-[#767676] whitespace-nowrap">{label}</span>
              </div>
              {i < 2 && <div className={`h-px w-12 mb-4 mx-2 transition-all duration-500 ${i < stepIdx ? 'bg-black' : 'bg-[#e5e5e5]'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-5 md:px-14 py-10">
        <AnimatePresence mode="wait">

          {/* Step 1 — Select garment */}
          {step === 'select' && (
            <motion.div key="select"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease }}>
              <p className="text-[12px] text-[#767676] mb-8 max-w-md leading-relaxed">
                Choose the piece you want to try on. Our AI places it on your photo in seconds.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRODUCTS.map(p => (
                  <button key={p.id} onClick={() => handleSelect(p)}
                    className="group relative overflow-hidden text-left focus:outline-none">
                    <div className="relative overflow-hidden bg-white border border-[#f0f0f0]" style={{ aspectRatio: '3/4' }}>
                      <img src={p.img} alt={p.name}
                        className="w-full h-full object-contain transition-transform duration-600 group-hover:scale-[1.03]"
                        style={{ display: 'block' }} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300 flex items-center justify-center">
                        <span className="bg-white text-black text-[9px] tracking-[0.22em] uppercase px-4 py-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          Select
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-[12px] leading-tight">{p.name}</p>
                      <p className="text-[11px] text-[#767676] mt-0.5">{p.price}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2 — Upload photo */}
          {step === 'upload' && (
            <motion.div key="upload"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35, ease }}
              className="max-w-lg">

              {selected && (
                <div className="flex items-center gap-4 mb-8 p-4 bg-[#f9f9f9]">
                  <img src={selected.img} alt={selected.name}
                    className="w-14 flex-shrink-0 object-contain bg-white"
                    style={{ aspectRatio: '3/4', display: 'block' }} />
                  <div>
                    <p className="text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-0.5">Selected Style</p>
                    <p className="text-[13px]">{selected.name}</p>
                    <p className="text-[12px] text-[#767676]">{selected.price}</p>
                  </div>
                  <button onClick={() => setStep('select')}
                    className="ml-auto text-[10px] tracking-[0.15em] uppercase text-[#767676] hover:text-black underline underline-offset-2 transition-colors">
                    Change
                  </button>
                </div>
              )}

              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-[12px] text-red-700">
                  {error}
                </div>
              )}

              <p className="text-[12px] text-[#767676] mb-6 leading-relaxed">
                Upload a front-facing full-body photo for best results. A plain background works best.
              </p>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button onClick={() => fileRef.current?.click()}
                className="w-full border border-dashed border-[#ccc] hover:border-black transition-colors duration-200 py-16 flex flex-col items-center gap-3 group">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"
                  className="text-[#ccc] group-hover:text-black transition-colors duration-200">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                <div className="text-center">
                  <p className="text-[12px] text-[#767676] group-hover:text-black transition-colors">Upload your photo</p>
                  <p className="text-[10px] text-[#aaa] mt-0.5">JPG or PNG · Any size</p>
                </div>
              </button>

              <div className="mt-7 space-y-2">
                {['Front-facing, full-body photo works best', 'Plain or simple background preferred', 'Good lighting helps the AI'].map(t => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#ccc] flex-shrink-0" />
                    <p className="text-[11px] text-[#999]">{t}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Processing */}
          {step === 'processing' && (
            <motion.div key="processing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-6">

              {userPhoto && (
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#e5e5e5] flex-shrink-0">
                  <img src={userPhoto} alt="Your photo" className="w-full h-full object-cover object-top" style={{ display: 'block' }} />
                </div>
              )}

              <div className="w-full max-w-xs">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#767676]">Generating your look</p>
                  <p className="text-[11px] text-[#aaa]">{Math.round(progress)}%</p>
                </div>
                <div className="w-full h-px bg-[#e5e5e5] overflow-hidden">
                  <motion.div className="h-full bg-black" style={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>

              <p className="text-[11px] text-[#aaa] text-center max-w-xs leading-relaxed">
                The AI is placing the garment on your photo.<br />This takes 10–20 seconds.
              </p>
              <div className="w-4 h-4 border border-black border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {/* Result */}
          {step === 'result' && resultUrl && selected && (
            <motion.div key="result"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease }}
              className="max-w-2xl">

              <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-8">

                {/* AI result */}
                <div>
                  <div className="relative overflow-hidden bg-[#f5f5f5]">
                    <img src={resultUrl} alt="AI Try-On Result" className="w-full object-cover" style={{ display: 'block' }} />
                    <div className="absolute top-3 left-3 bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1.5">
                      AI Try-On
                    </div>
                  </div>
                  <p className="text-[10px] text-[#aaa] mt-2 text-center tracking-[0.1em]">Generated by Fashn AI · Results may vary</p>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-5">
                  <div className="p-5 bg-[#f9f9f9]">
                    <img src={selected.img} alt={selected.name} className="w-full mb-4 object-contain bg-white"
                      style={{ aspectRatio: '3/4', display: 'block' }} />
                    <p className="text-[10px] tracking-[0.25em] uppercase text-[#767676] mb-0.5">You tried on</p>
                    <p className="text-[14px] font-light mb-0.5">{selected.name}</p>
                    <p className="text-[13px] text-[#767676] mb-5">{selected.price}</p>
                    <Link href={`/shop/${selected.id}`}
                      className="block w-full bg-black text-white text-[10px] tracking-[0.22em] uppercase py-3.5 text-center hover:opacity-75 transition-opacity">
                      Add to Bag
                    </Link>
                  </div>

                  <a href={`https://wa.me/918980008826?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 border border-[#e5e5e5] py-3.5 text-[10px] tracking-[0.2em] uppercase hover:border-black transition-all">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Get Styled on WhatsApp
                  </a>

                  <button onClick={() => { setStep('upload'); setResultUrl(null); }}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2">
                    Try a Different Photo
                  </button>
                  <button onClick={handleReset}
                    className="text-[10px] tracking-[0.2em] uppercase text-[#767676] hover:text-black transition-colors underline underline-offset-2">
                    Try a Different Style
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Bottom bar ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#e5e5e5] px-5 md:px-14 py-4 flex items-center justify-between z-20">
        <p className="text-[10px] text-[#aaa] tracking-[0.1em]">ARA Virtual Try-On · Powered by Fashn AI</p>
        <a href={`https://wa.me/918980008826?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="text-[10px] tracking-[0.2em] uppercase hover:opacity-60 transition-opacity flex items-center gap-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Talk to a Stylist
        </a>
      </div>
    </div>
  );
}
