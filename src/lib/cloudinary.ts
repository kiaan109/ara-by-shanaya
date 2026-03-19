export function getCloudinaryUploadUrl() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error("Cloudinary is not configured. Add NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET.");
  }

  return `https://api.cloudinary.com/v1_1/${cloudName}/image/upload?upload_preset=${preset}`;
}
