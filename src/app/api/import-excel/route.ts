import { NextRequest, NextResponse } from "next/server";
import { parseExcelProducts } from "@/lib/excel";
import { upsertProduct } from "@/lib/product-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an Excel file." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const parsedProducts = parseExcelProducts(buffer);

    if (!parsedProducts.length) {
      return NextResponse.json({ error: "No valid rows found in file." }, { status: 400 });
    }

    await Promise.all(parsedProducts.map((product) => upsertProduct(product)));
    return NextResponse.json({ imported: parsedProducts.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Import failed." },
      { status: 500 },
    );
  }
}
