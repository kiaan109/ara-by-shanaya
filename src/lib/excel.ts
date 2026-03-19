import * as XLSX from "xlsx";
import { ProductInput } from "@/types/product";

type Row = Record<string, unknown>;

function pickValue(row: Row, candidates: string[]) {
  const key = Object.keys(row).find((k) =>
    candidates.some((c) => k.toLowerCase().trim() === c.toLowerCase().trim()),
  );
  return key ? row[key] : undefined;
}

function parseSizes(value: unknown) {
  if (!value) return [];
  return String(value)
    .split(/[|,/]/)
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);
}

function parseImages(value: unknown, second?: unknown, third?: unknown) {
  const joined = [value, second, third]
    .filter(Boolean)
    .map((v) => String(v))
    .join(",");

  return joined
    .split(",")
    .map((img) => img.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export function parseExcelProducts(buffer: ArrayBuffer): ProductInput[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Row>(sheet, { defval: "" });

  const products: ProductInput[] = [];

  rows.forEach((row) => {
      const name = pickValue(row, ["Outfit Name", "Name", "Product Name"]);
      const priceRaw = pickValue(row, ["Price", "Amount"]);
      const category = pickValue(row, ["Category", "Type"]) || "Casual";
      const sizesRaw = pickValue(row, ["Sizes", "Size"]);
      const images = parseImages(
        pickValue(row, ["Image Links", "Images", "Image 1"]),
        pickValue(row, ["Image 2"]),
        pickValue(row, ["Image 3"]),
      );

      const numericPrice = Number(String(priceRaw).replace(/[^\d.]/g, ""));
      if (!name || Number.isNaN(numericPrice)) return;

      const product: ProductInput = {
        name: String(name).trim(),
        price: numericPrice,
        category: String(category).trim(),
        sizes: parseSizes(sizesRaw),
        images,
        description: `${String(name).trim()} by ARA by Shanaya`,
        featured: false,
      };

      products.push({
        ...product,
        description: product.description ?? product.name,
        category: product.category || "Casual",
        sizes: product.sizes.length ? product.sizes : ["S", "M", "L"],
        images: product.images.length ? product.images : [],
      });
    });

  return products;
}
