"use client";

import { useState } from "react";

const fileToDataUrl = async (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });

export function TryOnClient() {
  const [userFile, setUserFile] = useState<File | null>(null);
  const [outfitFile, setOutfitFile] = useState<File | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!userFile || !outfitFile) {
      setError("Upload both user image and outfit image.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);
    try {
      const [userImage, outfitImage] = await Promise.all([fileToDataUrl(userFile), fileToDataUrl(outfitFile)]);
      const response = await fetch("/api/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userImage, outfitImage }),
      });
      const data = (await response.json()) as { image?: string; error?: string };
      if (!response.ok || !data.image) throw new Error(data.error || "AI try-on failed.");
      setResult(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ara-container py-12">
      <h1 className="mb-6 font-serif text-6xl">AI Try-On</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="rounded-2xl border border-dashed border-[var(--ara-border)] bg-white p-5">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-[var(--ara-muted)]">Upload user photo</p>
          <input type="file" accept="image/*" onChange={(e) => setUserFile(e.target.files?.[0] || null)} />
        </label>
        <label className="rounded-2xl border border-dashed border-[var(--ara-border)] bg-white p-5">
          <p className="mb-3 text-sm uppercase tracking-[0.18em] text-[var(--ara-muted)]">Upload outfit image</p>
          <input type="file" accept="image/*" onChange={(e) => setOutfitFile(e.target.files?.[0] || null)} />
        </label>
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="ara-gold-btn mt-5 rounded-full px-8 py-3 text-xs uppercase tracking-[0.2em] disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Try-On"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--ara-border)] bg-white p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">Before</p>
          {userFile ? <img src={URL.createObjectURL(userFile)} alt="User preview" className="h-[420px] w-full rounded-xl object-cover" /> : <div className="h-[420px] rounded-xl bg-[var(--ara-ivory)]" />}
        </div>
        <div className="rounded-2xl border border-[var(--ara-border)] bg-white p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[var(--ara-muted)]">After</p>
          {result ? <img src={result} alt="Try-on result" className="h-[420px] w-full rounded-xl object-cover" /> : <div className="h-[420px] rounded-xl bg-[var(--ara-ivory)]" />}
        </div>
      </div>
    </section>
  );
}
