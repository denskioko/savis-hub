import Compressor from "compressorjs";

export async function compressImage(file: File, maxBytes = 200 * 1024): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Please select an image file.");
  if (file.size <= maxBytes) return file;

  let quality = 0.82;
  let scale = 1;

  for (let attempt = 0; attempt < 6; attempt++) {
    const result = await new Promise<Blob>((resolve, reject) => {
      new Compressor(file, {
        quality,
        maxWidth: 1600 * scale,
        maxHeight: 1600 * scale,
        convertSize: maxBytes,
        success: resolve,
        error: reject,
      });
    });

    if (result.size <= maxBytes) {
      return new File([result], file.name.replace(/\.[^.]+$/, ".jpg"), {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    }

    quality *= 0.82;
    scale *= 0.88;
  }

  throw new Error("Image could not be compressed below 200 KB. Please choose a smaller image.");
}
