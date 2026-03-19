import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runTryOn } from "@/lib/tryon";

const schema = z.object({
  userImage: z.string().min(10),
  outfitImage: z.string().min(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const image = await runTryOn(body);
    return NextResponse.json({ image });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Try-on failed." },
      { status: 400 },
    );
  }
}
