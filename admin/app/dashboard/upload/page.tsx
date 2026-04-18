'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { uploadExcel } from '@/lib/api';
import toast from 'react-hot-toast';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export default function UploadPage() {
  const [file,       setFile]       = useState<File | null>(null);
  const [uploading,  setUploading]  = useState(false);
  const [result,     setResult]     = useState<{ created: number; errors: string[]; products: any[] } | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { toast.error('Select an Excel file first'); return; }
    setUploading(true);
    setResult(null);
    try {
      const data = await uploadExcel(file);
      setResult(data);
      toast.success(`${data.created} products imported!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-light text-white mb-1">Bulk Upload</h1>
        <p className="text-gray-600 text-sm mb-10">Import products from Excel spreadsheet</p>
      </motion.div>

      {/* Instructions */}
      <div className="bg-luxury-card border border-gold-500/10 rounded-lg p-6 mb-8">
        <h2 className="text-white text-sm mb-4">Excel Format</h2>
        <div className="overflow-x-auto">
          <table className="text-xs w-full">
            <thead>
              <tr className="text-gold-400 border-b border-gold-500/10">
                {['name *', 'price *', 'description', 'category', 'sizes', 'colors'].map((h) => (
                  <th key={h} className="text-left pb-2 pr-4 font-mono">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="text-gray-500">
                <td className="py-2 pr-4">Silk Saree</td>
                <td className="py-2 pr-4">15000</td>
                <td className="py-2 pr-4">Beautiful saree...</td>
                <td className="py-2 pr-4">Saree</td>
                <td className="py-2 pr-4">Free Size</td>
                <td className="py-2 pr-4">#FF0000,#FFD700</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-gray-700 text-xs mt-4">
          Categories: Saree, Lehenga, Kurti, Gown, Suit, Dupatta, Other<br/>
          Sizes: XS, S, M, L, XL, XXL, Free Size (comma-separated)
        </p>
        <a
          href={`${BACKEND}/api/upload/template`}
          className="inline-block mt-4 text-gold-400 hover:text-gold-300 text-xs underline"
        >
          ↓ Download Template
        </a>
      </div>

      {/* Upload form */}
      <div className="bg-luxury-card border border-gold-500/10 rounded-lg p-6 mb-8">
        <form onSubmit={handleUpload} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wide text-gray-500 mb-3">Select Excel File (.xlsx)</label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gold-500/20 hover:border-gold-500/50 rounded-lg p-10 cursor-pointer transition-all group">
              <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              <div className="text-3xl text-gold-500/30 group-hover:text-gold-500/60 transition-colors mb-3">↑</div>
              {file ? (
                <p className="text-gold-400 text-sm">{file.name}</p>
              ) : (
                <p className="text-gray-500 text-sm">Click to select or drag and drop</p>
              )}
              <p className="text-gray-700 text-xs mt-1">.xlsx, .xls, .csv</p>
            </label>
          </div>

          <button
            type="submit"
            disabled={!file || uploading}
            className="w-full bg-gold-500 text-black py-3 text-sm font-semibold rounded-sm hover:bg-gold-400 transition-colors disabled:opacity-40"
          >
            {uploading ? 'Importing...' : 'Import Products'}
          </button>
        </form>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-luxury-card border border-gold-500/10 rounded-lg p-6"
        >
          <h3 className="text-white mb-4">Import Result</h3>
          <div className="flex gap-6 mb-4">
            <div className="text-center">
              <p className="text-3xl text-green-400 font-semibold">{result.created}</p>
              <p className="text-gray-600 text-xs">Imported</p>
            </div>
            <div className="text-center">
              <p className="text-3xl text-red-400 font-semibold">{result.errors.length}</p>
              <p className="text-gray-600 text-xs">Errors</p>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-4 mb-4">
              <p className="text-red-400 text-xs mb-2">Errors:</p>
              <ul className="space-y-1">
                {result.errors.map((e, i) => <li key={i} className="text-red-400/70 text-xs">• {e}</li>)}
              </ul>
            </div>
          )}
          {result.products.length > 0 && (
            <div>
              <p className="text-gray-500 text-xs mb-2">Imported products:</p>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {result.products.map((p) => (
                  <div key={p._id} className="flex justify-between text-xs text-gray-400">
                    <span>{p.name}</span>
                    <span className="text-gold-400">₹{p.price?.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
