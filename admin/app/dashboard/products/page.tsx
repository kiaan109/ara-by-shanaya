'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/lib/api';
import toast from 'react-hot-toast';

const BACKEND    = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const CATEGORIES = ['Saree', 'Lehenga', 'Kurti', 'Gown', 'Suit', 'Dupatta', 'Other'];
const SIZES      = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

interface Product {
  _id: string; name: string; price: number; description: string;
  category: string; images: string[]; colors: string[]; sizes: string[]; inStock: boolean;
}

const emptyForm = {
  name: '', price: '', description: '', category: 'Other',
  colors: '', sizes: [] as string[], inStock: true, featured: false,
};

export default function ProductsPage() {
  const [products,      setProducts]      = useState<Product[]>([]);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [showModal,     setShowModal]     = useState(false);
  const [editing,       setEditing]       = useState<Product | null>(null);
  const [form,          setForm]          = useState(emptyForm);
  const [files,         setFiles]         = useState<File[]>([]);
  const [saving,        setSaving]        = useState(false);
  const [deletingId,    setDeletingId]    = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [uploadingImg,  setUploadingImg]  = useState('');

  const load = () => {
    setLoading(true);
    getProducts({ page, limit: 12 })
      .then((d) => { setProducts(d.products || []); setTotal(d.total || 0); })
      .catch(() => toast.error('Failed to load products'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFiles([]); setShowModal(true); };
  const openEdit   = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), description: p.description,
              category: p.category, colors: p.colors.join(', '), sizes: p.sizes,
              inStock: p.inStock, featured: false });
    setFiles([]);
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name);
      fd.append('price',       form.price);
      fd.append('description', form.description);
      fd.append('category',    form.category);
      fd.append('colors',      JSON.stringify(form.colors.split(',').map((c) => c.trim()).filter(Boolean)));
      fd.append('sizes',       JSON.stringify(form.sizes));
      fd.append('inStock',     String(form.inStock));
      fd.append('featured',    String(form.featured));
      files.forEach((f) => fd.append('images', f));
      if (editing) { await updateProduct(editing._id, fd); toast.success('Product updated ✓'); }
      else         { await createProduct(fd);              toast.success('Product created ✓'); }
      setShowModal(false);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    setConfirmDelete(null);
    setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      toast.success(`"${product.name}" removed`);
      load();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingId('');
    }
  };

  const handleQuickPhoto = async (productId: string, file: File) => {
    setUploadingImg(productId);
    try {
      await uploadProductImage(productId, file);
      toast.success('Photo updated ✓');
      load();
    } catch {
      toast.error('Photo upload failed');
    } finally {
      setUploadingImg('');
    }
  };

  const toggleSize = (s: string) =>
    setForm((f) => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter((x) => x !== s) : [...f.sizes, s] }));

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-light text-gray-900">Products</h1>
          <p className="text-gray-400 text-sm">{total} total products</p>
        </div>
        <button onClick={openCreate}
          className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 text-sm font-medium rounded-sm transition-colors flex items-center gap-2">
          <span>+</span> New Product
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-sm" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">No products yet.</p>
          <button onClick={openCreate} className="text-amber-700 underline text-sm">Add your first product</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => {
            const img = p.images?.[0] ? `${BACKEND}/${p.images[0]}` : '';
            const isDeleting = deletingId === p._id;
            return (
              <motion.div
                key={p._id}
                layout
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`bg-white border border-gray-200 rounded-sm overflow-hidden group transition-shadow hover:shadow-md ${isDeleting ? 'opacity-50' : ''}`}
              >
                {/* Image */}
                <div className="relative bg-gray-50" style={{ aspectRatio: '3/4' }}>
                  {img ? (
                    <div className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${img})` }} />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-gray-400">No photo</span>
                    </div>
                  )}

                  {/* Quick photo upload — camera icon, always visible bottom-right */}
                  <label className="absolute bottom-2 right-2 z-10 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleQuickPhoto(p._id, e.target.files[0])} />
                    <span className={`flex items-center gap-1 bg-black/60 hover:bg-amber-700 text-white text-[10px] px-2 py-1 rounded-sm transition-colors ${uploadingImg === p._id ? 'opacity-60' : ''}`}>
                      {uploadingImg === p._id ? '⏳' : '📷'} {uploadingImg === p._id ? 'Uploading…' : 'Change Photo'}
                    </span>
                  </label>

                  {/* Action overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => openEdit(p)}
                      className="bg-white text-gray-700 text-xs font-medium px-3 py-2 rounded-sm hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      ✎ Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(p)}
                      disabled={isDeleting}
                      className="bg-red-500 text-white text-xs font-medium px-3 py-2 rounded-sm hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? '...' : '✕ Remove'}
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-gray-900 text-sm font-medium truncate">{p.name}</p>
                  <p className="text-amber-700 text-sm">₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">{p.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-sm ${p.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-400'}`}>
                      {p.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                </div>

                {/* Always-visible delete button at bottom */}
                <button
                  onClick={() => setConfirmDelete(p)}
                  disabled={isDeleting}
                  className="w-full py-2 text-xs text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors border-t border-gray-100 font-medium disabled:opacity-40"
                >
                  {isDeleting ? 'Removing...' : '🗑 Remove Dress'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-8 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 text-sm rounded-sm transition-all ${page === p ? 'bg-amber-700 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-amber-400'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-sm shadow-xl p-8 max-w-sm w-full text-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Remove Dress?</h3>
              <p className="text-gray-500 text-sm mb-6">
                "<strong>{confirmDelete.name}</strong>" will be permanently removed from the collection.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 text-sm border border-gray-200 text-gray-600 rounded-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 text-sm bg-red-500 text-white rounded-sm hover:bg-red-600 transition-colors font-medium">
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Create / Edit Modal ── */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-sm w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl">

              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Name *</label>
                    <input value={form.name} onChange={(e) => setForm(f => ({...f, name: e.target.value}))} required
                      placeholder="e.g. MINTY GREEN DRESS"
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={(e) => setForm(f => ({...f, price: e.target.value}))} required min="0"
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))} rows={3}
                    className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
                    <select value={form.category} onChange={(e) => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500 bg-white">
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase tracking-wide mb-1.5">Colors (comma separated)</label>
                    <input value={form.colors} onChange={(e) => setForm(f => ({...f, colors: e.target.value}))}
                      placeholder="#FF0000, #00FF00"
                      className="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {SIZES.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 text-xs rounded-sm border transition-all ${
                          form.sizes.includes(s) ? 'bg-amber-700 text-white border-amber-700' : 'border-gray-200 text-gray-500 hover:border-amber-400'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.inStock} onChange={(e) => setForm(f => ({...f, inStock: e.target.checked}))} className="accent-amber-700" />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                    <input type="checkbox" checked={form.featured} onChange={(e) => setForm(f => ({...f, featured: e.target.checked}))} className="accent-amber-700" />
                    Featured on Homepage
                  </label>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">Product Images</label>
                  <label className="flex items-center gap-3 border border-dashed border-gray-200 rounded-sm p-4 cursor-pointer hover:border-amber-400 transition-colors group">
                    <input type="file" accept="image/*" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} className="hidden" />
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-400">
                      {files.length > 0 ? `${files.length} image(s) selected` : 'Click to upload images'}
                    </span>
                  </label>
                  {editing && editing.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {editing.images.map((img) => (
                        <img key={img} src={`${BACKEND}/${img}`} alt="" className="w-16 h-20 object-cover rounded-sm border border-gray-200" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white py-3 text-sm font-medium rounded-sm transition-colors disabled:opacity-50">
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 border border-gray-200 text-gray-500 rounded-sm hover:bg-gray-50 transition-colors text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
