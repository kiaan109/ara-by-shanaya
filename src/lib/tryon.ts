interface TryOnRequest {
  userImage: string;
  outfitImage: string;
}

function normalizeReplicateOutput(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output[0] && typeof output[0] === "string") return output[0];
  if (output && typeof output === "object" && "image" in output) {
    const image = (output as { image?: string }).image;
    return image ?? null;
  }
  return null;
}

async function runReplicateTryOn({ userImage, outfitImage }: TryOnRequest) {
  const token = process.env.REPLICATE_API_TOKEN;
  const version = process.env.REPLICATE_MODEL_VERSION;
  if (!token || !version) {
    throw new Error("Replicate is not configured. Add REPLICATE_API_TOKEN and REPLICATE_MODEL_VERSION.");
  }

  const userKey = process.env.REPLICATE_USER_IMAGE_KEY || "human_img";
  const outfitKey = process.env.REPLICATE_OUTFIT_IMAGE_KEY || "garm_img";

  const start = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version,
      input: {
        [userKey]: userImage,
        [outfitKey]: outfitImage,
      },
    }),
  });

  if (!start.ok) {
    const body = await start.text();
    throw new Error(`Replicate start failed: ${body}`);
  }

  const prediction = (await start.json()) as { urls?: { get?: string } };
  if (!prediction.urls?.get) throw new Error("Replicate did not return a polling URL.");

  for (let i = 0; i < 30; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const poll = await fetch(prediction.urls.get, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    });
    if (!poll.ok) continue;

    const data = (await poll.json()) as { status?: string; output?: unknown; error?: string };
    if (data.status === "succeeded") {
      const image = normalizeReplicateOutput(data.output);
      if (!image) throw new Error("Replicate succeeded but no image was returned.");
      return image;
    }
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(data.error || "Try-on generation failed.");
    }
  }

  throw new Error("Try-on generation timed out.");
}

export async function runTryOn(payload: TryOnRequest) {
  return runReplicateTryOn(payload);
}
