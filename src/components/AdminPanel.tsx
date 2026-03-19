"use client";

import { FormEvent, useState } from "react";

export function AdminPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Casual",
    sizes: "S,M,L",
    images: "",
  });

  const uploadExcel = async () => {
    if (!file) return setStatus("Select an .xlsx file first.");
    setStatus("Uploading and importing...");
    const data = new FormData();
    data.append("file", file);

    const res = await fetch("/api/import-excel", { method: "POST", body: data });
    const json = (await res.json()) as { imported?: number; error?: string };
    setStatus(res.ok ? `Imported ${json.imported ?? 0} products.` : json.error || "Import failed.");
  };

  const addManual = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("Saving product...");
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        price: Number(form.price),
        category: form.category,
        sizes: form.sizes.split(",").map((s) => s.trim()),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    const json = (await res.json()) as { error?: string };
    setStatus(res.ok ? "Product saved successfully." : json.error || "Could not save product.");
  };

  return (
    <section className="ara-container py-12">
      <h1 className="mb-8 font-serif text-6xl">Admin Dashboard</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--ara-border)] bg-white p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Excel upload</p>
          <input type="file" accept=".xlsx,.xls" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <button type="button" onClick={uploadExcel} className="ara-gold-btn mt-4 rounded-full px-6 py-3 text-xs uppercase tracking-[0.2em]">
            Import Spreadsheet
          </button>
        </div>

        <form onSubmit={addManual} className="rounded-2xl border border-[var(--ara-border)] bg-white p-6">
          <p className="mb-4 text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Add / Edit product</p>
          <div className="space-y-3">
            <input className="w-full rounded-xl border p-3" placeholder="Outfit Name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
            <input className="w-full rounded-xl border p-3" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))} required />
            <input className="w-full rounded-xl border p-3" placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            <input className="w-full rounded-xl border p-3" placeholder="Sizes (comma separated)" value={form.sizes} onChange={(e) => setForm((prev) => ({ ...prev, sizes: e.target.value }))} />
            <textarea className="w-full rounded-xl border p-3" placeholder="Image URLs (comma separated)" value={form.images} onChange={(e) => setForm((prev) => ({ ...prev, images: e.target.value }))} />
            <button type="submit" className="rounded-full border border-[var(--ara-gold)] px-6 py-3 text-xs uppercase tracking-[0.2em] text-[var(--ara-gold)]">
              Save Product
            </button>
          </div>
        </form>
      </div>
      {status ? <p className="mt-4 text-sm">{status}</p> : null}
    </section>
  );
}
