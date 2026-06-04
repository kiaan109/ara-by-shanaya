'use client';
import { useState, useRef } from 'react';

const FRONTEND    = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://frontend-iota-three-66.vercel.app';
const CATEGORIES  = ['Dress', 'Top', 'Skirt', 'Pants', 'Shorts', 'Set', 'Blazer', 'Other'];
const COLLECTIONS = ['Dark Cloud', 'Horizon', 'Ocean', 'Beach', 'Waves', 'Pink Skies', 'Orange Vista', 'Other'];
const SIZES_LIST  = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

export default function UploadPage() {
  const [form, setForm] = useState({
    name: '', price: '', description: '',
    category: 'Dress', collection: 'Dark Cloud',
    colors: '', sizes: ['XS','S','M','L','XL'],
    featured: false,
  });
  const [images,   setImages]   = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [saving,   setSaving]   = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const url = URL.createObjectURL(f);
      setPreviews(prev => [...prev, url]);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const toggleSize = (s: string) =>
    setForm(prev => ({
      ...prev,
      sizes: prev.sizes.includes(s) ? prev.sizes.filter(x => x !== s) : [...prev.sizes, s],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) { setError('Name and price are required'); return; }
    if (images.length === 0) { setError('Add at least one product image'); return; }

    setSaving(true); setError(''); setSuccess('');

    const data = new FormData();
    data.append('name',        form.name);
    data.append('price',       form.price);
    data.append('description', form.description);
    data.append('category',    form.category);
    data.append('collection',  form.collection);
    data.append('colors',      form.colors);
    data.append('sizes',       form.sizes.join(','));
    data.append('featured',    String(form.featured));
    images.forEach(f => data.append('images', f));

    try {
      const res = await fetch(`${FRONTEND}/api/admin/products`, { method: 'POST', body: data });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      setSuccess(`"${form.name}" added to the store!`);
      setForm({ name:'', price:'', description:'', category:'Dress', collection:'Dark Cloud', colors:'', sizes:['XS','S','M','L','XL'], featured:false });
      setImages([]); setPreviews([]);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-xl font-light">Add New Product</h1>
        <p className="text-[12px] text-[#767676] mt-1">Upload photos and fill in the details — the product goes live immediately.</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">

        {/* Image upload */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-3">
            Product Photos <span className="text-red-500">*</span>
          </label>

          {/* Drag area */}
          <div
            className="border-2 border-dashed border-[#e5e5e5] hover:border-black transition-colors p-8 text-center cursor-pointer"
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault();
              const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
              setImages(prev => [...prev, ...files]);
              files.forEach(f => setPreviews(prev => [...prev, URL.createObjectURL(f)]));
            }}>
            <span className="material-symbols-outlined text-[36px] text-[#ccc] block mb-2">cloud_upload</span>
            <p className="text-[13px] text-[#767676]">Drag photos here or click to browse</p>
            <p className="text-[11px] text-[#aaa] mt-1">JPG, PNG · Multiple files OK</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />

          {/* Previews */}
          {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4">
              {previews.map((src, i) => (
                <div key={i} className="relative group w-20">
                  <div className="aspect-[3/4] overflow-hidden bg-[#f5f5f5]">
                    <img src={src} alt="" className="w-full h-full object-contain" style={{ display:'block' }} />
                  </div>
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                  {i === 0 && <p className="text-[9px] text-center text-[#aaa] mt-1">Main</p>}
                </div>
              ))}
              <button type="button" onClick={() => fileRef.current?.click()}
                className="w-20 aspect-[3/4] border border-dashed border-[#e5e5e5] hover:border-black transition-colors flex items-center justify-center text-[#aaa] hover:text-black text-2xl">
                +
              </button>
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))}
            placeholder="e.g. Dark Cloud Corset Maxi"
            className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors" />
        </div>

        {/* Price */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">
            Price (₹) <span className="text-red-500">*</span>
          </label>
          <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))}
            placeholder="e.g. 8500"
            className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors" />
        </div>

        {/* Category + Collection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({...p, category: e.target.value}))}
              className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black bg-white">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Collection</label>
            <select value={form.collection} onChange={e => setForm(p => ({...p, collection: e.target.value}))}
              className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black bg-white">
              {COLLECTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Sizes */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-3">Sizes</label>
          <div className="flex flex-wrap gap-2">
            {SIZES_LIST.map(s => (
              <button key={s} type="button" onClick={() => toggleSize(s)}
                className={`px-4 py-2 text-[11px] tracking-[0.1em] uppercase border transition-all ${
                  form.sizes.includes(s) ? 'bg-black text-white border-black' : 'bg-white text-[#767676] border-[#e5e5e5] hover:border-black'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Colours</label>
          <input type="text" value={form.colors} onChange={e => setForm(p => ({...p, colors: e.target.value}))}
            placeholder="e.g. Dark Cloud, Pink, Multi"
            className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors" />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Description</label>
          <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))}
            rows={3} placeholder="Describe the piece..."
            className="w-full border border-[#e5e5e5] px-4 py-3 text-[13px] focus:outline-none focus:border-black transition-colors resize-none" />
        </div>

        {/* Featured toggle */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setForm(p => ({...p, featured: !p.featured}))}
            className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? 'bg-black' : 'bg-[#e5e5e5]'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className="text-[12px] text-[#767676]">Feature this product on the homepage</span>
        </div>

        {/* Errors / Success */}
        {error   && <p className="text-[12px] text-red-500 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
        {success && <p className="text-[12px] text-green-700 bg-green-50 border border-green-200 px-4 py-3">✓ {success}</p>}

        {/* Submit */}
        <button type="submit" disabled={saving}
          className="w-full bg-black text-white text-[11px] tracking-[0.2em] uppercase py-4 hover:opacity-75 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2">
          {saving ? (
            <>
              <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Uploading...
            </>
          ) : 'Add Product to Store'}
        </button>

        <p className="text-[11px] text-[#aaa] text-center">
          Product goes live on the store immediately after upload.
        </p>
      </form>
    </div>
  );
}
