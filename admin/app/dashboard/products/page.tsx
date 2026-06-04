'use client';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from '@/lib/api';
import toast from 'react-hot-toast';

const BACKEND    = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
const CATEGORIES = ['Dress', 'Top', 'Skirt', 'Set', 'Blazer', 'Other'];
const SIZES      = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];

interface Product {
  _id: string; name: string; price: number; description: string;
  category: string; images: string[]; colors: string[]; sizes: string[]; inStock: boolean;
}

const emptyForm = {
  name: '', price: '', description: '', category: 'Dress',
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
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
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
    setFiles([]); setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { toast.error('Name and price are required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name); fd.append('price', form.price);
      fd.append('description', form.description); fd.append('category', form.category);
      fd.append('colors', JSON.stringify(form.colors.split(',').map(c => c.trim()).filter(Boolean)));
      fd.append('sizes', JSON.stringify(form.sizes));
      fd.append('inStock', String(form.inStock)); fd.append('featured', String(form.featured));
      files.forEach(f => fd.append('images', f));
      if (editing) { await updateProduct(editing._id, fd); toast.success('Product updated'); }
      else         { await createProduct(fd);              toast.success('Product created'); }
      setShowModal(false); load();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (product: Product) => {
    setConfirmDelete(null); setDeletingId(product._id);
    try {
      await deleteProduct(product._id);
      toast.success(`"${product.name}" removed`); load();
    } catch { toast.error('Delete failed'); }
    finally { setDeletingId(''); }
  };

  const handleQuickPhoto = async (productId: string, file: File) => {
    setUploadingImg(productId);
    try { await uploadProductImage(productId, file); toast.success('Photo updated'); load(); }
    catch { toast.error('Photo upload failed'); }
    finally { setUploadingImg(''); }
  };

  const toggleSize = (s: string) =>
    setForm(f => ({ ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s] }));

  const totalPages = Math.ceil(total / 12);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-light tracking-[-0.01em]">Products</h1>
          <p className="text-[12px] text-[#767676] mt-1">{total} total products</p>
        </div>
        <button onClick={openCreate}
          className="bg-black text-white text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:opacity-75 transition-opacity flex items-center gap-2">
          <span className="text-base leading-none">+</span> New Product
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => <div key={i} className="bg-white border border-[#e5e5e5] animate-pulse" style={{ aspectRatio: '3/4' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[12px] text-[#767676] mb-4">No products yet.</p>
          <button onClick={openCreate} className="text-[11px] tracking-[0.15em] uppercase underline underline-offset-2">Add your first product</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => {
            const img = p.images?.[0] ? `${BACKEND}/${p.images[0]}` : '';
            const isDeleting = deletingId === p._id;
            return (
              <motion.div key={p._id} layout initial={{ opacity: 0 }} animate={{ opacity: isDeleting ? 0.4 : 1 }}
                className="bg-white border border-[#e5e5e5] overflow-hidden group hover:border-black transition-all">
                {/* Image */}
                <div className="relative bg-[#f0f0f0]" style={{ aspectRatio: '3/4' }}>
                  {img ? (
                    <div className="absolute inset-0 bg-cover bg-center bg-top" style={{ backgroundImage: `url(${img})` }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Quick photo */}
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden"
                      onChange={e => e.target.files?.[0] && handleQuickPhoto(p._id, e.target.files[0])} />
                    <span className={`flex items-center gap-1 bg-black/60 text-white text-[9px] px-2 py-1 transition-all ${uploadingImg === p._id ? 'opacity-60' : 'hover:bg-black'}`}>
                      {uploadingImg === p._id ? '⏳' : '📷'}
                    </span>
                  </label>

                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => openEdit(p)}
                      className="bg-white text-black text-[10px] tracking-[0.1em] uppercase px-3 py-2 hover:bg-black hover:text-white transition-all">
                      Edit
                    </button>
                    <button onClick={() => setConfirmDelete(p)} disabled={isDeleting}
                      className="bg-white text-red-500 text-[10px] tracking-[0.1em] uppercase px-3 py-2 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50">
                      Remove
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-[12px] truncate">{p.name}</p>
                  <p className="text-[12px] text-[#767676] mt-0.5">₹{p.price.toLocaleString('en-IN')}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] tracking-[0.1em] uppercase text-[#767676]">{p.category}</span>
                    <span className={`text-[9px] tracking-[0.1em] uppercase px-1.5 py-0.5 ${p.inStock ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {p.inStock ? 'In Stock' : 'Out'}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-1 mt-8 justify-center">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 text-[11px] transition-all ${page === p ? 'bg-black text-white' : 'text-[#767676] border border-[#e5e5e5] hover:border-black'}`}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Delete confirm modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setConfirmDelete(null)}>
            <motion.div initial={{ scale: 0.97 }} animate={{ scale: 1 }} exit={{ scale: 0.97 }}
              className="bg-white p-8 max-w-sm w-full text-center">
              <h3 className="text-[15px] font-light mb-2">Remove Product?</h3>
              <p className="text-[12px] text-[#767676] mb-6">
                "<strong className="text-black">{confirmDelete.name}</strong>" will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 text-[11px] tracking-[0.1em] uppercase border border-[#e5e5e5] hover:border-black transition-all">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 text-[11px] tracking-[0.1em] uppercase bg-red-500 text-white hover:bg-red-600 transition-colors">
                  Remove
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && setShowModal(false)}>
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }}
              className="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto">

              <div className="px-6 py-4 border-b border-[#e5e5e5] flex justify-between items-center">
                <h2 className="text-[13px] tracking-[0.1em] uppercase">{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="text-[#767676] hover:text-black transition-colors text-xl leading-none">×</button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1.5">Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
                      placeholder="Product name"
                      className="w-full border border-[#e5e5e5] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors" />
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1.5">Price (₹) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} required min="0"
                      className="w-full border border-[#e5e5e5] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1.5">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3}
                    className="w-full border border-[#e5e5e5] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}
                      className="w-full border border-[#e5e5e5] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors bg-white">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-1.5">Colors (comma separated)</label>
                    <input value={form.colors} onChange={e => setForm(f => ({...f, colors: e.target.value}))}
                      placeholder="Black, White, Red"
                      className="w-full border border-[#e5e5e5] px-3 py-2.5 text-[13px] focus:outline-none focus:border-black transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Sizes</label>
                  <div className="flex gap-2 flex-wrap">
                    {SIZES.map(s => (
                      <button key={s} type="button" onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 text-[11px] tracking-[0.05em] border transition-all ${
                          form.sizes.includes(s) ? 'bg-black text-white border-black' : 'border-[#e5e5e5] text-[#767676] hover:border-black'
                        }`}>{s}</button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#444]">
                    <input type="checkbox" checked={form.inStock} onChange={e => setForm(f => ({...f, inStock: e.target.checked}))} />
                    In Stock
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#444]">
                    <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} />
                    Featured
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] tracking-[0.2em] uppercase text-[#767676] mb-2">Product Images</label>
                  <label className="flex items-center gap-3 border border-dashed border-[#e5e5e5] p-4 cursor-pointer hover:border-black transition-colors">
                    <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} className="hidden" />
                    <svg className="w-5 h-5 text-[#ccc]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[12px] text-[#767676]">
                      {files.length > 0 ? `${files.length} image(s) selected` : 'Click to upload images'}
                    </span>
                  </label>
                  {editing && editing.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {editing.images.map(img => (
                        <img key={img} src={`${BACKEND}/${img}`} alt="" className="w-14 h-18 object-cover object-top border border-[#e5e5e5]" style={{ height: '72px' }} />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={saving}
                    className="flex-1 bg-black text-white text-[11px] tracking-[0.15em] uppercase py-3.5 hover:opacity-75 transition-opacity disabled:opacity-40">
                    {saving ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)}
                    className="px-6 border border-[#e5e5e5] text-[#767676] hover:border-black hover:text-black transition-all text-[11px] uppercase tracking-[0.1em]">
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
