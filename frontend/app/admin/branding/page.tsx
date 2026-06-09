'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BrandingPage() {
  const [logoUrl,    setLogoUrl]    = useState<string | null>(null);
  const [preview,    setPreview]    = useState<string | null>(null);
  const [file,       setFile]       = useState<File | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [removing,   setRemoving]   = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [loading,    setLoading]    = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load current settings
  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(s => { setLogoUrl(s.logoUrl || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please upload an image file (PNG, JPG, SVG, WebP)', 'err');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5 MB', 'err');
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  const cancelPreview = () => { setFile(null); setPreview(null); };

  const uploadLogo = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('logo', file);
      const res = await fetch('/api/admin/logo', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setLogoUrl(data.logoUrl);
      setFile(null);
      setPreview(null);
      showToast('Logo updated — changes are live on the site!', 'ok');
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    setRemoving(true);
    try {
      const res = await fetch('/api/admin/logo', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove logo');
      setLogoUrl(null);
      setFile(null);
      setPreview(null);
      showToast('Logo removed — site will show text brand name', 'ok');
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="p-5 lg:p-8 space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-light tracking-wide">Branding</h1>
        <p className="text-[11px] text-white/30 mt-1">
          Upload your logo to replace the text brand name in the navbar.
        </p>
      </div>

      {/* Current logo */}
      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/40">Current Logo</h2>
        </div>
        <div className="px-5 py-6">
          {loading ? (
            <div className="flex items-center gap-3 text-white/30 text-[12px]">
              <div className="w-4 h-4 border border-white/20 border-t-white/60 rounded-full animate-spin flex-shrink-0" />
              Loading…
            </div>
          ) : logoUrl ? (
            <div className="space-y-4">
              {/* Live preview — simulate the navbar glass look */}
              <div className="rounded-md overflow-hidden border border-white/[0.08] bg-white/10 backdrop-blur-sm px-6 py-3 flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-[28px] w-auto max-w-[200px] object-contain"
                  style={{ filter: 'none' }}
                />
              </div>
              <p className="text-[10px] text-white/25 font-mono truncate">{logoUrl}</p>
              <button
                onClick={removeLogo}
                disabled={removing}
                className="flex items-center gap-2 px-4 py-2 rounded-md text-[11px] text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all disabled:opacity-40"
              >
                {removing ? (
                  <div className="w-3 h-3 border border-red-400/40 border-t-red-400 rounded-full animate-spin" />
                ) : (
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                )}
                {removing ? 'Removing…' : 'Remove logo'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Text fallback preview */}
              <div className="rounded-md border border-white/[0.08] bg-white/10 px-6 py-3 flex items-center justify-center">
                <span className="font-display text-[13px] tracking-[0.25em] uppercase font-light text-[#1a1c1c]">
                  ARA <span className="text-[#C5A059]">by</span> SHANAYA
                </span>
              </div>
              <div>
                <p className="text-[11px] text-white/50">No logo uploaded</p>
                <p className="text-[10px] text-white/25 mt-0.5">Showing text brand name</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload area */}
      <div className="bg-[#1a1a1a] border border-white/[0.06] rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-white/40">Upload New Logo</h2>
        </div>
        <div className="px-5 py-6 space-y-5">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
              ${dragging
                ? 'border-[#C5A059] bg-[#C5A059]/5'
                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'
              }
            `}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              className="hidden"
              onChange={onInputChange}
            />
            <div className="flex flex-col items-center gap-3">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1"
                className="text-white/20" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <div>
                <p className="text-[12px] text-white/50">
                  {dragging ? 'Drop your logo here' : 'Drag & drop or click to choose'}
                </p>
                <p className="text-[10px] text-white/20 mt-1">PNG, JPG, SVG or WebP · max 5 MB</p>
              </div>
            </div>
          </div>

          {/* Preview of selected file */}
          <AnimatePresence>
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="border border-white/[0.08] rounded-lg p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-white/50 tracking-[0.1em] uppercase">Preview</p>
                  <button onClick={cancelPreview} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
                    Cancel
                  </button>
                </div>

                {/* Simulate navbar: light background */}
                <div className="rounded-md bg-white/95 border border-black/5 px-6 py-3 flex items-center justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-[30px] w-auto max-w-[200px] object-contain"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={uploadLogo}
                    disabled={uploading}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-[11px] tracking-[0.1em] uppercase
                      bg-[#C5A059] text-black font-medium hover:bg-[#d4b06a] transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="w-3 h-3 border border-black/30 border-t-black/80 rounded-full animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="17,8 12,3 7,8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Save Logo
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-white/25">
                    {file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tips */}
          <div className="space-y-2">
            <p className="text-[10px] tracking-[0.15em] uppercase text-white/20">Tips for best results</p>
            <ul className="space-y-1.5 text-[11px] text-white/30">
              <li className="flex items-start gap-2">
                <span className="text-[#C5A059] mt-0.5 flex-shrink-0">·</span>
                Use a transparent PNG or SVG for a clean look on the glass navbar
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A059] mt-0.5 flex-shrink-0">·</span>
                Dark or black logo works best — the navbar background is light/frosted white
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A059] mt-0.5 flex-shrink-0">·</span>
                Ideal dimensions: wide and short (e.g. 400 × 80 px) for horizontal logos
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A059] mt-0.5 flex-shrink-0">·</span>
                Logo is displayed at 28–32 px tall — higher res looks sharp on Retina screens
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-md shadow-xl text-[12px] font-medium
              ${toast.type === 'ok'
                ? 'bg-[#1e1e1e] border border-[#C5A059]/30 text-white'
                : 'bg-[#1e1e1e] border border-red-500/30 text-red-400'
              }`}
          >
            {toast.type === 'ok'
              ? <span className="text-[#C5A059]">✓</span>
              : <span className="text-red-400">✕</span>
            }
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
