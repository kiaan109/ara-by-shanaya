'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '@/lib/api';
import { Product } from '@/components/ProductCard';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

type Step = 'upload-person' | 'select-cloth' | 'generating' | 'result';

export default function TryOnPage() {
  const [step,           setStep]          = useState<Step>('upload-person');
  const [personFile,     setPersonFile]    = useState<File | null>(null);
  const [personPreview,  setPersonPreview] = useState('');
  const [clothPreview,   setClothPreview]  = useState('');
  const [resultUrl,      setResultUrl]     = useState('');
  const [uploading,      setUploading]     = useState(false);
  const [products,       setProducts]      = useState<Product[]>([]);
  const [clothesType,    setClothesType]   = useState<'upper_body'|'lower_body'|'full_body'>('upper_body');
  const [useWebcam,      setUseWebcam]     = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    getProducts({ limit: 20 }).then((d) => setProducts(d.products || d)).catch(() => {});
  }, []);

  /* ── Webcam ─────────────────────────────────────────────── */
  const stopWebcam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setUseWebcam(false);
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setUseWebcam(true);
    } catch {
      toast.error('Cannot access camera. Please allow camera permission.');
    }
  };

  const captureWebcam = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width  = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    canvasRef.current.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      handlePersonFile(file);
      stopWebcam();
    }, 'image/jpeg', 0.9);
  };

  /* ── Person photo ────────────────────────────────────────── */
  const handlePersonFile = (file: File) => {
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
    toast.success('Photo ready!');
    setStep('select-cloth');
  };

  /* ── Try-on generation ───────────────────────────────────── */
  const runTryOn = async (clothFile: File) => {
    if (!personFile) { toast.error('Upload your photo first'); return; }

    setStep('generating');
    setUploading(true);
    try {
      const form = new FormData();
      form.append('person_image',  personFile);
      form.append('clothes_image', clothFile);
      form.append('clothes_type',  clothesType);

      const res = await fetch(`${BACKEND}/api/tryon`, {
        method: 'POST',
        body:   form,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Try-on failed');

      setResultUrl(data.image_url);
      setStep('result');
      toast.success('Try-on ready! ✨');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed. Please try again.');
      setStep('select-cloth');
    } finally {
      setUploading(false);
    }
  };

  /* ── Select from catalogue ───────────────────────────────── */
  const handleClothSelect = async (product: Product) => {
    const imgUrl = product.images?.[0]
      ? (product.images[0].startsWith('http') ? product.images[0] : `${BACKEND}/${product.images[0]}`)
      : '';
    if (!imgUrl) { toast.error('No image for this product'); return; }

    setClothPreview(imgUrl);
    try {
      const resp = await fetch(imgUrl);
      const blob = await resp.blob();
      const file = new File([blob], 'cloth.jpg', { type: blob.type });
      await runTryOn(file);
    } catch {
      toast.error('Could not load clothing image');
    }
  };

  /* ── Upload custom cloth ─────────────────────────────────── */
  const handleClothFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClothPreview(URL.createObjectURL(file));
    await runTryOn(file);
  };

  const reset = () => {
    setStep('upload-person');
    setPersonFile(null); setPersonPreview('');
    setClothPreview(''); setResultUrl('');
    stopWebcam();
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="section-subtitle">Powered by AILab AI</p>
          <h1 className="section-title">Virtual Try-On</h1>
          <p className="text-gray-500 max-w-lg mx-auto mt-4 text-sm leading-relaxed">
            Upload your photo, select a garment, and see a photorealistic AI result in seconds.
          </p>
        </motion.div>

        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[
            { id: 'upload-person', label: 'Your Photo' },
            { id: 'select-cloth',  label: 'Clothing' },
            { id: 'generating',    label: 'Generating' },
            { id: 'result',        label: 'Result' },
          ].map((s, i) => {
            const steps  = ['upload-person', 'select-cloth', 'generating', 'result'];
            const active = steps.indexOf(step) >= i;
            return (
              <div key={s.id} className="flex items-center gap-4">
                <div className={`flex flex-col items-center gap-1 transition-all ${active ? 'opacity-100' : 'opacity-30'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    step === s.id
                      ? 'bg-amber-600 text-white border-amber-600'
                      : active
                        ? 'bg-amber-100 text-amber-600 border-amber-400'
                        : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {steps.indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-500 hidden sm:block">{s.label}</span>
                </div>
                {i < 3 && <div className={`w-12 h-px transition-all ${active && steps.indexOf(step) > i ? 'bg-amber-400' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">

          {/* ── STEP 1: Upload Person ── */}
          {step === 'upload-person' && (
            <motion.div key="person" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="max-w-lg mx-auto">
              <div className="border border-gray-200 rounded-sm p-8 bg-white shadow-sm">
                <h2 className="text-xl font-medium text-gray-900 mb-2 text-center">Upload Your Photo</h2>
                <p className="text-gray-400 text-sm text-center mb-8">
                  Full-body, front-facing photo gives the best results.
                </p>

                {/* Clothes type selector */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 mb-2 text-center uppercase tracking-widest">What are you trying on?</p>
                  <div className="flex gap-2 justify-center">
                    {(['upper_body','lower_body','full_body'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setClothesType(t)}
                        className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                          clothesType === t
                            ? 'bg-amber-700 text-white border-amber-700'
                            : 'border-gray-200 text-gray-500 hover:border-amber-400'
                        }`}
                      >
                        {t === 'upper_body' ? 'Top / Shirt' : t === 'lower_body' ? 'Skirt / Pants' : 'Full Outfit'}
                      </button>
                    ))}
                  </div>
                </div>

                {!useWebcam ? (
                  <div className="space-y-4">
                    <label className="block border-2 border-dashed border-gray-200 hover:border-amber-400 rounded p-12 text-center cursor-pointer transition-all group">
                      <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePersonFile(f); }} className="hidden" />
                      <div className="text-3xl text-gray-300 group-hover:text-amber-400 transition-colors mb-3">↑</div>
                      <p className="text-gray-400 text-sm">Click to upload or drag & drop</p>
                      <p className="text-gray-300 text-xs mt-1">JPG, PNG up to 3MB</p>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gray-100" />
                      <span className="text-gray-300 text-xs">or</span>
                      <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <button onClick={startWebcam} className="w-full py-2.5 text-sm border border-gray-200 text-gray-600 rounded-sm hover:border-amber-400 transition-colors">
                      Use Webcam
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded overflow-hidden bg-gray-50">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded" />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={captureWebcam} className="flex-1 py-2.5 text-sm bg-amber-700 text-white rounded-sm hover:bg-amber-800 transition-colors">Capture</button>
                      <button onClick={stopWebcam} className="py-2.5 px-4 text-sm border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Select Clothing ── */}
          {step === 'select-cloth' && (
            <motion.div key="cloth" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Person preview */}
                <div className="lg:w-56 flex-shrink-0">
                  <div className="border border-gray-200 rounded-sm p-4 bg-white text-center shadow-sm">
                    <p className="text-xs text-gray-400 tracking-widest uppercase mb-3">Your Photo</p>
                    {personPreview && <img src={personPreview} alt="Person" className="w-full rounded object-cover max-h-72" />}
                    <button onClick={reset} className="mt-3 text-xs text-gray-400 hover:text-amber-600 transition-colors">Change photo</button>
                  </div>
                </div>

                {/* Clothing selection */}
                <div className="flex-1">
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Select a Garment</h2>

                  {/* Upload custom cloth */}
                  <label className="flex items-center gap-4 p-4 border border-dashed border-gray-200 hover:border-amber-400 rounded-sm cursor-pointer transition-all mb-6 group">
                    <input type="file" accept="image/*" onChange={handleClothFileChange} className="hidden" disabled={uploading} />
                    <div className="w-12 h-12 rounded bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-amber-400 transition-colors text-2xl">↑</div>
                    <div>
                      <p className="text-gray-700 text-sm font-medium">Upload your own clothing image</p>
                      <p className="text-gray-400 text-xs">White/plain background works best</p>
                    </div>
                  </label>

                  {uploading && (
                    <div className="text-center py-12">
                      <div className="inline-block w-8 h-8 border-2 border-t-amber-600 border-amber-200 rounded-full animate-spin" />
                      <p className="text-amber-700 text-sm mt-3">Generating your try-on... (~30 seconds)</p>
                    </div>
                  )}

                  {!uploading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {products.map((p) => {
                        const img = p.images?.[0]
                          ? (p.images[0].startsWith('http') ? p.images[0] : `${BACKEND}/${p.images[0]}`)
                          : '';
                        return (
                          <button
                            key={p._id}
                            onClick={() => handleClothSelect(p)}
                            className="border border-gray-200 rounded-sm p-3 text-left hover:border-amber-400 hover:shadow-sm transition-all group bg-white"
                          >
                            <div
                              className="w-full h-32 bg-gray-50 rounded-sm mb-2 bg-cover bg-center"
                              style={img ? { backgroundImage: `url(${img})` } : {}}
                            />
                            <p className="text-gray-700 text-xs truncate group-hover:text-amber-700 transition-colors font-medium">{p.name}</p>
                            <p className="text-amber-600 text-xs">₹{p.price.toLocaleString('en-IN')}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Generating ── */}
          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-8">
              <div className="relative w-20 h-20">
                <motion.div className="absolute inset-0 border-2 border-amber-200 rounded-full" />
                <motion.div className="absolute inset-0 border-t-2 border-amber-600 rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-amber-600 text-xl">✦</span>
                </div>
              </div>
              <div className="text-center">
                <h2 className="text-xl font-medium text-gray-900 mb-3">Generating Your Try-On</h2>
                <p className="text-gray-400 text-sm">AILab AI is processing your image…</p>
                <p className="text-gray-300 text-xs mt-2">This takes about 30–60 seconds</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-64">
                {['Uploading images', 'Detecting body pose', 'Fitting garment', 'Finalising result'].map((msg, i) => (
                  <motion.div key={msg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 8 }}
                    className="flex items-center gap-3 text-xs text-gray-400 w-full">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      className="w-3 h-3 border border-amber-200 border-t-amber-600 rounded-full flex-shrink-0" />
                    {msg}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Result ── */}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-light text-gray-900 text-center mb-10">Your AI Try-On Result</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'You',       src: personPreview },
                  { label: 'Clothing',  src: clothPreview },
                  { label: 'AI Result', src: resultUrl, highlight: true },
                ].map(({ label, src, highlight }) => (
                  <div key={label} className={`border rounded-sm overflow-hidden bg-white shadow-sm ${highlight ? 'border-amber-400 shadow-amber-100' : 'border-gray-200'}`}>
                    <div className="relative">
                      {highlight && (
                        <div className="absolute top-2 right-2 z-10 bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider">
                          AI RESULT
                        </div>
                      )}
                      {src
                        ? <img src={src} alt={label} className="w-full h-72 object-cover" />
                        : <div className="w-full h-72 bg-gray-50 flex items-center justify-center"><span className="text-gray-300 text-xs">No image</span></div>
                      }
                    </div>
                    <p className="text-center text-xs text-gray-400 py-3 tracking-widest uppercase">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={resultUrl} target="_blank" rel="noopener noreferrer"
                  className="px-8 py-3 bg-amber-700 text-white text-sm font-medium rounded-sm hover:bg-amber-800 transition-colors text-center">
                  Download Result
                </a>
                <button onClick={reset}
                  className="px-8 py-3 border border-gray-200 text-gray-600 text-sm font-medium rounded-sm hover:border-amber-400 transition-colors">
                  Try Another
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
