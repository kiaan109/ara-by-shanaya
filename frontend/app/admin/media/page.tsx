'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

type MediaItem = { url: string; pathname: string; uploadedAt: string; size: number };

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: 'Free',   value: undefined },
  { label: '1:1',    value: 1 },
  { label: '3:4',    value: 3 / 4 },
  { label: '4:5',    value: 4 / 5 },
  { label: '2:3',    value: 2 / 3 },
  { label: '16:9',   value: 16 / 9 },
];

function centerAspectCrop(width: number, height: number, aspect: number) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
    width,
    height,
  );
}

// Render the cropped area of an <img> onto a canvas and return a Blob
function getCroppedBlob(image: HTMLImageElement, crop: PixelCrop, mime: string): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const pixelRatio = window.devicePixelRatio || 1;

  canvas.width  = Math.floor(crop.width * scaleX * pixelRatio);
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.resolve(null);

  ctx.scale(pixelRatio, pixelRatio);
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY,
  );

  return new Promise(resolve => canvas.toBlob(resolve, mime, 0.92));
}

export default function MediaLibraryPage() {
  const [items,     setItems]     = useState<MediaItem[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [dragging,  setDragging]  = useState(false);
  const [toast,     setToast]     = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [q,         setQ]         = useState('');

  // Crop modal state
  const [rawSrc,    setRawSrc]    = useState<string | null>(null);
  const [rawType,   setRawType]   = useState<string>('image/jpeg');
  const [rawName,   setRawName]   = useState<string>('photo');
  const [crop,      setCrop]      = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect,    setAspect]    = useState<number | undefined>(3 / 4);
  const [uploading, setUploading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const imgRef   = useRef<HTMLImageElement | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = () => {
    setLoading(true);
    fetch('/api/admin/media', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── File selection ──────────────────────────────────────────────
  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      showToast('Please choose an image file (PNG, JPG, WebP)', 'err');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      showToast('Image must be under 20 MB', 'err');
      return;
    }
    setRawType(f.type === 'image/png' ? 'image/png' : f.type === 'image/webp' ? 'image/webp' : 'image/jpeg');
    setRawName(f.name);
    const reader = new FileReader();
    reader.onload = e => setRawSrc(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
    e.target.value = '';
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imgRef.current = e.currentTarget;
    const { width, height } = e.currentTarget;
    if (aspect) {
      setCrop(centerAspectCrop(width, height, aspect));
    } else {
      setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const changeAspect = (a: number | undefined) => {
    setAspect(a);
    if (imgRef.current) {
      const { width, height } = imgRef.current;
      if (a) setCrop(centerAspectCrop(width, height, a));
      else setCrop({ unit: '%', x: 5, y: 5, width: 90, height: 90 });
    }
  };

  const closeCrop = () => {
    setRawSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    imgRef.current = null;
  };

  // ── Upload (cropped or full) ────────────────────────────────────
  const uploadBlob = async (blob: Blob, name: string) => {
    setUploading(true);
    try {
      const fd = new FormData();
      const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
      fd.append('file', blob, `${name}.${ext}`);
      const res = await fetch('/api/admin/media', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      showToast('Photo uploaded to your media library', 'ok');
      closeCrop();
      load();
    } catch (e: any) {
      showToast(e.message, 'err');
    } finally {
      setUploading(false);
    }
  };

  const uploadCropped = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
      showToast('Drag to select a crop area first', 'err');
      return;
    }
    const blob = await getCroppedBlob(imgRef.current, completedCrop, rawType);
    if (!blob) { showToast('Could not process image', 'err'); return; }
    await uploadBlob(blob, rawName.replace(/\.[^/.]+$/, ''));
  };

  const uploadOriginal = async () => {
    if (!rawSrc) return;
    const r = await fetch(rawSrc);
    const blob = await r.blob();
    await uploadBlob(blob, rawName.replace(/\.[^/.]+$/, ''));
  };

  // ── Delete ───────────────────────────────────────────────────────
  const removeItem = async (url: string) => {
    if (!confirm('Delete this photo permanently?')) return;
    try {
      const res = await fetch('/api/admin/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error('Delete failed');
      setItems(its => its.filter(i => i.url !== url));
      showToast('Photo deleted', 'ok');
    } catch (e: any) {
      showToast(e.message, 'err');
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard?.writeText(url);
    showToast('Image URL copied — paste it into Product Images', 'ok');
  };

  const filtered = items.filter(i => !q || i.pathname.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="p-5 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-light tracking-wide">Media Library</h1>
          <p className="text-[11px] text-gray-400 mt-1">
            Upload your own photos, crop them, then copy the link into a product&apos;s Images.
          </p>
        </div>
        <input
          value={q} onChange={e => setQ(e.target.value)}
          placeholder="Search uploads…"
          className="border border-gray-200 rounded-md px-3 py-2 text-[12px] w-48 focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Upload drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all bg-white
          ${dragging ? 'border-[#C5A059] bg-[#C5A059]/5' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="flex flex-col items-center gap-3">
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1" className="text-gray-300" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17,8 12,3 7,8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <div>
            <p className="text-[12px] text-gray-600">
              {dragging ? 'Drop your photo here' : 'Drag & drop a photo, or click to choose'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">PNG, JPG or WebP · max 20 MB · you&apos;ll be able to crop next</p>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-[11px] tracking-[0.2em] uppercase text-gray-500">Your Uploads</h2>
          <span className="text-[10px] text-gray-400">{items.length} photo{items.length === 1 ? '' : 's'}</span>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center gap-3 text-gray-400 text-[12px]">
              <div className="w-4 h-4 border border-gray-200 border-t-gray-500 rounded-full animate-spin flex-shrink-0" />
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[12px] text-gray-400">No photos uploaded yet — drop one above to get started.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map(item => (
                <div key={item.url} className="group relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={item.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center gap-1.5 p-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => copyUrl(item.url)}
                      className="text-[10px] px-2 py-1 rounded bg-white/90 text-gray-800 hover:bg-white font-medium"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => removeItem(item.url)}
                      className="text-[10px] px-2 py-1 rounded bg-red-500/90 text-white hover:bg-red-500 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Crop modal */}
      <AnimatePresence>
        {rawSrc && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/70 flex items-center justify-center p-4"
            onClick={closeCrop}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200">
                <span className="font-semibold text-gray-800 text-sm">Crop Photo</span>
                <button onClick={closeCrop} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>

              {/* Aspect ratio chooser */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 overflow-x-auto">
                {ASPECTS.map(a => (
                  <button
                    key={a.label}
                    onClick={() => changeAspect(a.value)}
                    className={`text-[11px] px-3 py-1 rounded-full font-medium transition-colors whitespace-nowrap ${
                      aspect === a.value ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>

              {/* Crop area */}
              <div className="overflow-auto p-4 flex-1 bg-gray-50 flex items-center justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={c => setCompletedCrop(c)}
                  aspect={aspect}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={rawSrc} alt="" onLoad={onImageLoad} style={{ maxHeight: '60vh' }} />
                </ReactCrop>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-200">
                <button
                  onClick={uploadCropped}
                  disabled={uploading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md text-[11px] tracking-[0.1em] uppercase
                    bg-[#C5A059] text-black font-medium hover:bg-[#d4b06a] transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-3 h-3 border border-black/30 border-t-black/80 rounded-full animate-spin" />
                      Uploading…
                    </>
                  ) : 'Upload Cropped Photo'}
                </button>
                <button
                  onClick={uploadOriginal}
                  disabled={uploading}
                  className="px-4 py-2.5 rounded-md text-[11px] tracking-[0.1em] uppercase border border-gray-300 text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Upload Original
                </button>
                <button
                  onClick={closeCrop}
                  className="ml-auto text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`fixed bottom-6 right-6 z-[999] flex items-center gap-3 px-5 py-3 rounded-md shadow-xl text-[12px] font-medium
              ${toast.type === 'ok'
                ? 'bg-white border border-[#C5A059]/30 text-gray-900'
                : 'bg-white border border-red-300 text-red-600'
              }`}
          >
            {toast.type === 'ok' ? <span className="text-[#C5A059]">✓</span> : <span className="text-red-600">✕</span>}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
