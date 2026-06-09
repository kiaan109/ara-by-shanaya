'use client';
import { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Product = {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  collection: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  featured: boolean;
  images: string[];
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COLLECTIONS = ['Dark Cloud','Horizon','Ocean','Beach','Waves','Pink Skies','Orange Vista'];
const CATEGORIES  = ['Dress','Top','Skirt','Pants'];
const ALL_TABS    = ['All', ...COLLECTIONS];

// ─── Image Picker ─────────────────────────────────────────────────────────────
function ImagePicker({
  onSelect, onClose,
}: { onSelect: (url: string) => void; onClose: () => void }) {
  const [tab, setTab]       = useState<'products'|'lookbook'>('products');
  const [images, setImages] = useState<{ products: string[]; lookbook: string[] }>({ products: [], lookbook: [] });
  const [q, setQ]           = useState('');

  useEffect(() => {
    fetch('/api/admin/images').then(r => r.json()).then(setImages);
  }, []);

  const list = (tab === 'products' ? images.products : images.lookbook)
    .filter(img => !q || img.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b">
          <span className="font-semibold text-gray-800 text-sm">Choose Image</span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
        </div>

        {/* Tabs + search */}
        <div className="flex items-center gap-3 px-5 pt-3 pb-2 border-b">
          {(['products','lookbook'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                tab === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}>
              {t === 'products' ? 'Product Photos' : 'Lookbook Pages'}
            </button>
          ))}
          <input
            value={q} onChange={e => setQ(e.target.value)}
            placeholder="Filter by name…"
            className="ml-auto border border-gray-200 rounded px-2.5 py-1 text-xs w-44 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* Grid */}
        <div className="overflow-y-auto p-4">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {list.map(img => (
              <button
                key={img}
                title={img}
                onClick={() => { onSelect(img); onClose(); }}
                className="group relative aspect-[3/4] overflow-hidden rounded border-2 border-transparent hover:border-black transition-colors bg-gray-100"
              >
                <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
            {list.length === 0 && (
              <div className="col-span-6 text-center py-10 text-gray-400 text-sm">No images found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Panel (expands inside each row) ─────────────────────────────────────
function EditPanel({
  product, onChange,
}: { product: Product; onChange: (updates: Partial<Product>) => void }) {
  const [picker, setPicker] = useState<number | null>(null);

  const setImage = (idx: number, url: string) => {
    const imgs = [...(product.images || [])];
    imgs[idx] = url;
    onChange({ images: imgs });
  };
  const addImage    = () => onChange({ images: [...(product.images || []), ''] });
  const removeImage = (idx: number) => onChange({ images: product.images.filter((_, i) => i !== idx) });

  return (
    <div className="px-4 pb-5 pt-3 border-t border-blue-100 bg-[#f8fbff]">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">

        {/* Name */}
        <div className="col-span-2">
          <label className="label">Product Name</label>
          <input value={product.name} onChange={e => onChange({ name: e.target.value })} className="inp" />
        </div>

        {/* Price */}
        <div>
          <label className="label">Price (₹)</label>
          <input type="number" value={product.price}
            onChange={e => onChange({ price: parseInt(e.target.value) || 0 })} className="inp" />
        </div>

        {/* Collection */}
        <div>
          <label className="label">Collection</label>
          <select value={product.collection} onChange={e => onChange({ collection: e.target.value })} className="inp">
            {COLLECTIONS.map(c => <option key={c}>{c}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category (Type)</label>
          <select value={product.category} onChange={e => onChange({ category: e.target.value })} className="inp">
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Stock */}
        <div>
          <label className="label">Stock Status</label>
          <select value={product.inStock ? 'true' : 'false'}
            onChange={e => onChange({ inStock: e.target.value === 'true' })} className="inp">
            <option value="true">In Stock</option>
            <option value="false">Sold Out</option>
          </select>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-2 pt-5">
          <input type="checkbox" id={`f-${product._id}`} checked={!!product.featured}
            onChange={e => onChange({ featured: e.target.checked })}
            className="w-4 h-4 rounded accent-black" />
          <label htmlFor={`f-${product._id}`} className="text-xs font-medium text-gray-700">
            Featured on homepage
          </label>
        </div>

        {/* Sizes */}
        <div>
          <label className="label">Sizes (comma-separated)</label>
          <input value={(product.sizes || []).join(', ')}
            onChange={e => onChange({ sizes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="XS, S, M, L, XL" className="inp" />
        </div>

        {/* Colors */}
        <div>
          <label className="label">Colors (comma-separated)</label>
          <input value={(product.colors || []).join(', ')}
            onChange={e => onChange({ colors: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
            placeholder="Black, White" className="inp" />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="label">Description</label>
          <textarea value={product.description || ''} rows={2}
            onChange={e => onChange({ description: e.target.value })}
            className="inp resize-none" />
        </div>
      </div>

      {/* ── Images ── */}
      <div>
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Images</span>
          <button onClick={addImage}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium">+ Add image slot</button>
        </div>

        <div className="flex flex-wrap gap-3">
          {(product.images || []).map((img, i) => (
            <div key={i} className="flex gap-2 bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              {/* Thumb */}
              <div className="w-14 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {img
                  ? <img src={img} alt="" className="w-full h-full object-cover" />
                  : <span className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">empty</span>
                }
              </div>
              {/* Controls */}
              <div className="flex flex-col gap-1.5 min-w-[190px]">
                <span className="text-[10px] text-gray-400 font-medium">Image {i + 1}</span>
                <input value={img}
                  onChange={e => setImage(i, e.target.value)}
                  placeholder="/products/filename.jpg"
                  className="border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-blue-400" />
                <div className="flex gap-3 mt-0.5">
                  <button onClick={() => setPicker(i)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium">Browse photos</button>
                  <button onClick={() => removeImage(i)}
                    className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
              </div>
            </div>
          ))}
          {(!product.images || product.images.length === 0) && (
            <p className="text-xs text-gray-400 italic">No images — click "+ Add image slot"</p>
          )}
        </div>
      </div>

      {/* Image picker modal */}
      {picker !== null && (
        <ImagePicker
          onSelect={url => setImage(picker, url)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminEditPage() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [dirty,     setDirty]     = useState(false);
  const [savedAt,   setSavedAt]   = useState<string | null>(null);
  const [expandId,  setExpandId]  = useState<string | null>(null);
  const [search,    setSearch]    = useState('');
  const [tab,       setTab]       = useState('All');

  // Load
  useEffect(() => {
    fetch('/api/products?limit=500')
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setLoading(false); });
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const touch = () => setDirty(true);

  const update = (id: string, updates: Partial<Product>) => {
    setProducts(ps => ps.map(p => p._id === id ? { ...p, ...updates } : p));
    touch();
  };

  const remove = (id: string) => {
    if (!confirm('Delete this product permanently?')) return;
    setProducts(ps => ps.filter(p => p._id !== id));
    touch();
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setProducts(ps => {
      const a = [...ps];
      [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
      return a;
    });
    touch();
  };

  const moveDown = (idx: number) => {
    setProducts(ps => {
      if (idx === ps.length - 1) return ps;
      const a = [...ps];
      [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]];
      return a;
    });
    touch();
  };

  const addProduct = () => {
    const id = `new-${Date.now()}`;
    const p: Product = {
      _id: id, name: 'New Product', price: 0, description: '',
      category: 'Dress', collection: 'Dark Cloud',
      sizes: ['XS','S','M','L','XL'], colors: [],
      inStock: true, featured: false, images: [],
    };
    setProducts(ps => [p, ...ps]);
    setExpandId(id);
    touch();
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const res  = await fetch('/api/admin/save-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products }),
      });
      const data = await res.json();
      if (data.ok) {
        setDirty(false);
        setSavedAt(new Date().toLocaleTimeString());
        alert(`✅ Saved! ${data.count} products updated on the live site.`);
      } else {
        alert('❌ Error saving: ' + (data.error || 'unknown'));
      }
    } catch {
      alert('❌ Network error — check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Filtered view ─────────────────────────────────────────────────────────
  const filtered = products.filter(p => {
    if (tab !== 'All' && p.collection !== tab) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Map from _id → index in the FULL products array (for move up/down)
  const idxOf = (id: string) => products.findIndex(p => p._id === id);

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-sm text-gray-500">Loading products…</div>
    </div>
  );

  return (
    <>
      {/* Inject utility classes inline since this page has no layout */}
      <style>{`
        .label { display:block; font-size:11px; font-weight:500; color:#374151; margin-bottom:3px; }
        .inp   { width:100%; border:1px solid #d1d5db; border-radius:4px; padding:6px 10px;
                 font-size:13px; outline:none; font-family:inherit; }
        .inp:focus { border-color:#6b7280; }
        select.inp { background:#fff; }
        * { box-sizing:border-box; margin:0; padding:0; }
        body { font-family: system-ui, sans-serif; background:#f3f4f6; }
      `}</style>

      <div className="min-h-screen bg-gray-50">

        {/* ── Sticky header ───────────────────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-900 text-sm">Product Editor</span>
            <span className="text-xs text-gray-400">{products.length} products total</span>
            {dirty && (
              <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                ● Unsaved changes
              </span>
            )}
            {savedAt && !dirty && (
              <span className="text-[11px] text-green-600">✓ Saved at {savedAt}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addProduct}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors font-medium">
              + Add Product
            </button>
            <button
              onClick={saveAll}
              disabled={saving || !dirty}
              className={`px-5 py-1.5 text-xs rounded font-semibold transition-colors ${
                dirty && !saving
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving…' : '💾 Save All Changes'}
            </button>
          </div>
        </div>

        {/* ── Collection tabs ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-gray-200 px-5 flex items-center gap-0 overflow-x-auto">
          {ALL_TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`whitespace-nowrap px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                tab === t
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              {t}
              {t !== 'All' && (
                <span className="ml-1.5 text-[10px] text-gray-400">
                  ({products.filter(p => p.collection === t).length})
                </span>
              )}
            </button>
          ))}

          {/* Search */}
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search product name…"
            className="ml-auto mr-0 border border-gray-200 rounded px-3 py-1.5 text-xs w-52 focus:outline-none focus:border-gray-400 my-2"
          />
        </div>

        {/* ── Count bar ────────────────────────────────────────────────── */}
        <div className="px-5 py-2 text-[11px] text-gray-400 bg-gray-50 border-b border-gray-100">
          Showing {filtered.length} of {products.length} products
          {tab !== 'All' && ` in ${tab}`}
          {search && ` matching "${search}"`}
          {(tab !== 'All' || search) && (
            <button onClick={() => { setTab('All'); setSearch(''); }}
              className="ml-2 text-blue-500 hover:text-blue-700">Clear</button>
          )}
        </div>

        {/* ── Product table ────────────────────────────────────────────── */}
        <div className="px-5 py-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">

            {/* Table head */}
            <div className="grid items-center bg-gray-50 border-b border-gray-200 px-4 py-2"
              style={{ gridTemplateColumns: '52px 1fr 130px 90px 80px 80px 90px' }}>
              {['Image','Name','Collection','Type','Price','Stock','Actions'].map(h => (
                <span key={h} className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{h}</span>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-sm text-gray-400">No products match your filters</div>
            )}

            {filtered.map(p => {
              const globalIdx = idxOf(p._id);
              const isOpen    = expandId === p._id;
              return (
                <div key={p._id} className={`border-b border-gray-100 last:border-0 ${isOpen ? 'ring-1 ring-inset ring-blue-200' : ''}`}>

                  {/* Row */}
                  <div
                    className="grid items-center px-4 py-2 cursor-pointer hover:bg-blue-50/40 transition-colors"
                    style={{ gridTemplateColumns: '52px 1fr 130px 90px 80px 80px 90px' }}
                    onClick={() => setExpandId(isOpen ? null : p._id)}
                  >
                    {/* Thumbnail */}
                    <div className="w-10 h-[52px] bg-gray-100 rounded overflow-hidden">
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        : <span className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">?</span>
                      }
                    </div>

                    {/* Name */}
                    <span className="text-sm font-medium text-gray-900 truncate pr-3">{p.name}</span>

                    {/* Collection */}
                    <span className="text-xs text-gray-600 truncate">{p.collection}</span>

                    {/* Category */}
                    <span className="text-xs text-gray-600">{p.category}</span>

                    {/* Price */}
                    <span className="text-sm text-gray-700">₹{(p.price||0).toLocaleString('en-IN')}</span>

                    {/* Stock */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded w-fit font-medium ${
                      p.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {p.inStock ? 'In Stock' : 'Sold Out'}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      {/* Move up/down */}
                      <button
                        onClick={() => moveUp(globalIdx)}
                        disabled={globalIdx === 0}
                        title="Move up"
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 text-sm">↑</button>
                      <button
                        onClick={() => moveDown(globalIdx)}
                        disabled={globalIdx === products.length - 1}
                        title="Move down"
                        className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-20 text-sm">↓</button>
                      {/* Edit toggle */}
                      <button
                        onClick={() => setExpandId(isOpen ? null : p._id)}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${
                          isOpen ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}>
                        {isOpen ? 'Close' : 'Edit'}
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => remove(p._id)}
                        className="text-[10px] px-2 py-0.5 rounded bg-red-50 text-red-500 hover:bg-red-100 font-medium transition-colors">
                        Del
                      </button>
                    </div>
                  </div>

                  {/* Expanded edit panel */}
                  {isOpen && (
                    <EditPanel
                      product={p}
                      onChange={updates => update(p._id, updates)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Bottom save bar (sticky when dirty) ─────────────────────── */}
        {dirty && (
          <div className="sticky bottom-0 bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-amber-800">
              You have unsaved changes. Click <strong>Save All Changes</strong> to push to the live site.
            </p>
            <button
              onClick={saveAll}
              disabled={saving}
              className="px-6 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-gray-800 transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : '💾 Save All Changes'}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
