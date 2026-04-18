'use client';
import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { uploadPersonImage, uploadClothImage, generateTryOn, getProducts } from '@/lib/api';
import { Product } from '@/components/ProductCard';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const AI_URL  = process.env.NEXT_PUBLIC_AI_URL      || 'http://localhost:8000';

type Step = 'upload-person' | 'select-cloth' | 'generating' | 'result';

export default function TryOnPage() {
  const [step,        setStep]        = useState<Step>('upload-person');
  const [personId,    setPersonId]    = useState('');
  const [personPreview, setPersonPreview] = useState('');
  const [clothId,     setClothId]     = useState('');
  const [clothPreview, setClothPreview] = useState('');
  const [resultUrl,   setResultUrl]   = useState('');
  const [uploading,   setUploading]   = useState(false);
  const [products,    setProducts]    = useState<Product[]>([]);
  const [useWebcam,   setUseWebcam]   = useState(false);
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    getProducts({ limit: 20 }).then((d) => setProducts(d.products || d)).catch(() => {});
  }, []);

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

  const captureWebcam = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width  = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx?.drawImage(videoRef.current, 0, 0);
    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'webcam.jpg', { type: 'image/jpeg' });
      await handlePersonUpload(file);
      stopWebcam();
    }, 'image/jpeg', 0.9);
  };

  const handlePersonUpload = async (file: File) => {
    setUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setPersonPreview(preview);
      const res = await uploadPersonImage(file);
      setPersonId(res.person_id);
      toast.success('Photo uploaded!');
      setStep('select-cloth');
    } catch {
      toast.error('Upload failed. Make sure AI module is running.');
    } finally {
      setUploading(false);
    }
  };

  const handlePersonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePersonUpload(file);
  };

  const handleClothSelect = async (product: Product) => {
    const imgUrl = product.images?.[0]
      ? product.images[0].startsWith('http') ? product.images[0] : `${BACKEND}/${product.images[0]}`
      : '';

    setUploading(true);
    try {
      let file: File;
      if (imgUrl) {
        const resp = await fetch(imgUrl);
        const blob = await resp.blob();
        file = new File([blob], 'cloth.jpg', { type: blob.type });
      } else {
        toast.error('No image for this product');
        setUploading(false);
        return;
      }
      setClothPreview(imgUrl);
      const res = await uploadClothImage(file);
      setClothId(res.cloth_id);
      toast.success('Clothing selected!');
      await handleGenerate(personId, res.cloth_id);
    } catch {
      toast.error('Selection failed. Make sure AI module is running.');
    } finally {
      setUploading(false);
    }
  };

  const handleClothFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setClothPreview(preview);
      const res = await uploadClothImage(file);
      setClothId(res.cloth_id);
      toast.success('Clothing uploaded!');
      await handleGenerate(personId, res.cloth_id);
    } catch {
      toast.error('Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async (pId: string, cId: string) => {
    setStep('generating');
    try {
      const res = await generateTryOn(pId, cId);
      const url = res.result_url.startsWith('http') ? res.result_url : `${AI_URL}/${res.result_url}`;
      setResultUrl(url);
      setStep('result');
      toast.success('Try-on generated! ✨');
    } catch {
      toast.error('Generation failed. Please try again.');
      setStep('select-cloth');
    }
  };

  const reset = () => {
    setStep('upload-person');
    setPersonId(''); setPersonPreview('');
    setClothId('');  setClothPreview('');
    setResultUrl('');
    stopWebcam();
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <p className="section-subtitle">Powered by Diffusion AI</p>
          <h1 className="section-title">Virtual Try-On</h1>
          <p className="text-gray-500 max-w-lg mx-auto mt-4 text-sm leading-relaxed">
            Upload your photo, select a garment, and see a photorealistic AI-generated result of how it looks on you.
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
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step === s.id ? 'bg-gold-500 text-black' : active ? 'bg-gold-500/30 text-gold-400 border border-gold-500/40' : 'bg-luxury-card text-gray-600'
                  }`}>
                    {steps.indexOf(step) > i ? '✓' : i + 1}
                  </div>
                  <span className="text-xs tracking-wide text-gray-500 hidden sm:block">{s.label}</span>
                </div>
                {i < 3 && <div className={`w-12 h-px transition-all ${active && steps.indexOf(step) > i ? 'bg-gold-400' : 'bg-luxury-border'}`} />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Upload Person ── */}
          {step === 'upload-person' && (
            <motion.div
              key="person"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="max-w-lg mx-auto"
            >
              <div className="luxury-card p-8">
                <h2 className="font-luxury text-2xl text-white mb-2 text-center">Upload Your Photo</h2>
                <p className="text-gray-500 text-sm text-center mb-8">
                  Use a full-body photo for best results. Front-facing, good lighting.
                </p>

                {!useWebcam ? (
                  <div className="space-y-4">
                    <label className="block border-2 border-dashed border-gold-500/30 hover:border-gold-500/60 rounded-lg p-12 text-center cursor-pointer transition-all group">
                      <input type="file" accept="image/*" onChange={handlePersonFileChange} className="hidden" disabled={uploading} />
                      <div className="text-4xl text-gold-500/30 group-hover:text-gold-500/60 transition-colors mb-3">↑</div>
                      <p className="text-gray-400 text-sm">Click to upload or drag & drop</p>
                      <p className="text-gray-600 text-xs mt-1">JPG, PNG up to 10MB</p>
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-luxury-border" />
                      <span className="text-gray-600 text-xs">or</span>
                      <div className="flex-1 h-px bg-luxury-border" />
                    </div>
                    <button onClick={startWebcam} className="btn-outline-gold w-full">
                      Use Webcam
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden bg-luxury-dark">
                      <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                    <div className="flex gap-3">
                      <button onClick={captureWebcam} disabled={uploading} className="btn-gold flex-1">
                        {uploading ? 'Processing...' : 'Capture Photo'}
                      </button>
                      <button onClick={stopWebcam} className="btn-outline-gold">Cancel</button>
                    </div>
                  </div>
                )}

                {uploading && !useWebcam && (
                  <div className="text-center mt-4">
                    <div className="inline-block w-6 h-6 border-2 border-t-gold-400 border-gold-400/20 rounded-full animate-spin" />
                    <p className="text-gold-400 text-xs mt-2">Uploading...</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Select Clothing ── */}
          {step === 'select-cloth' && (
            <motion.div
              key="cloth"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Person preview */}
                <div className="lg:w-64 flex-shrink-0">
                  <div className="luxury-card p-4 text-center">
                    <p className="text-xs text-gray-500 tracking-wide uppercase mb-3">Your Photo</p>
                    {personPreview && (
                      <img src={personPreview} alt="Person" className="w-full rounded object-cover max-h-80" />
                    )}
                    <button onClick={reset} className="mt-3 text-xs text-gray-600 hover:text-gold-400 transition-colors">
                      Change photo
                    </button>
                  </div>
                </div>

                {/* Clothing selection */}
                <div className="flex-1">
                  <h2 className="font-luxury text-2xl text-white mb-6">Select Clothing</h2>

                  {/* Upload custom cloth */}
                  <label className="luxury-card flex items-center gap-4 p-4 cursor-pointer hover:border-gold-500/60 transition-all mb-6 group">
                    <input type="file" accept="image/*" onChange={handleClothFileChange} className="hidden" disabled={uploading} />
                    <div className="w-12 h-12 rounded gold-border flex items-center justify-center text-gold-400/60 group-hover:text-gold-400 transition-colors text-2xl">↑</div>
                    <div>
                      <p className="text-white text-sm">Upload custom clothing image</p>
                      <p className="text-gray-600 text-xs">PNG or JPG with white/plain background works best</p>
                    </div>
                  </label>

                  {uploading && (
                    <div className="text-center py-8">
                      <div className="inline-block w-8 h-8 border-2 border-t-gold-400 border-gold-400/20 rounded-full animate-spin" />
                      <p className="text-gold-400 text-sm mt-3">Generating try-on...</p>
                    </div>
                  )}

                  {/* Products grid */}
                  {!uploading && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {products.map((p) => {
                        const img = p.images?.[0]
                          ? p.images[0].startsWith('http') ? p.images[0] : `${BACKEND}/${p.images[0]}`
                          : '';
                        return (
                          <button
                            key={p._id}
                            onClick={() => handleClothSelect(p)}
                            className="luxury-card p-3 text-left hover:border-gold-500/60 transition-all hover:-translate-y-0.5 group"
                          >
                            <div
                              className="w-full h-32 bg-luxury-dark rounded-sm mb-2 bg-cover bg-center"
                              style={img ? { backgroundImage: `url(${img})` } : {}}
                            />
                            <p className="text-white text-xs truncate group-hover:text-gold-300 transition-colors">{p.name}</p>
                            <p className="text-gold-400/70 text-xs">₹{p.price.toLocaleString('en-IN')}</p>
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
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-8"
            >
              <div className="relative w-24 h-24">
                <motion.div
                  className="absolute inset-0 border-2 border-gold-400/20 rounded-full"
                />
                <motion.div
                  className="absolute inset-0 border-t-2 border-gold-400 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-4 border-b-2 border-gold-600/60 rounded-full"
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-gold-400 text-2xl">✦</span>
                </div>
              </div>
              <div className="text-center">
                <h2 className="font-luxury text-2xl text-white mb-3">Generating Your Try-On</h2>
                <p className="text-gray-500 text-sm">AI diffusion model is processing your image...</p>
                <p className="text-gray-600 text-xs mt-2">This may take 30-60 seconds</p>
              </div>
              <div className="flex flex-col items-center gap-2 w-64">
                {['Detecting body pose', 'Segmenting clothing', 'Running diffusion model', 'Finalizing result'].map((msg, i) => (
                  <motion.div
                    key={msg}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.8 }}
                    className="flex items-center gap-3 text-xs text-gray-500 w-full"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                      className="w-3 h-3 border border-gold-400/40 border-t-gold-400 rounded-full flex-shrink-0"
                    />
                    {msg}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── STEP 4: Result ── */}
          {step === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="font-luxury text-3xl text-white text-center mb-10">Your AI Try-On Result</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                {[
                  { label: 'You',        src: personPreview },
                  { label: 'Clothing',   src: clothPreview },
                  { label: 'AI Result',  src: resultUrl, highlight: true },
                ].map(({ label, src, highlight }) => (
                  <div key={label} className={`luxury-card overflow-hidden ${highlight ? 'ring-2 ring-gold-400' : ''}`}>
                    <div className="relative">
                      {highlight && (
                        <div className="absolute top-2 right-2 z-10 bg-gold-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider">
                          AI RESULT
                        </div>
                      )}
                      {src ? (
                        <img src={src} alt={label} className="w-full h-72 object-cover" />
                      ) : (
                        <div className="w-full h-72 bg-luxury-dark flex items-center justify-center">
                          <span className="text-gray-600 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                    <p className="text-center text-xs text-gray-500 py-3 tracking-[0.2em] uppercase">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href={resultUrl} download="ara-tryon.jpg" className="btn-gold text-center">
                  Download Result
                </a>
                <button onClick={reset} className="btn-outline-gold">
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
