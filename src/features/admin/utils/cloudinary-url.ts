export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "thumb" | "scale" | "pad";
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  quality?: "auto" | number | string;
  gravity?: "auto" | "face" | "center";
}

/**
 * Transforms a Cloudinary secure delivery URL into an optimized URL with on-the-fly transformations.
 * If the URL is not a Cloudinary image URL, it safely returns the original URL unaltered.
 *
 * Example:
 * https://res.cloudinary.com/demo/image/upload/v1/sample.jpg
 * => https://res.cloudinary.com/demo/image/upload/c_fill,w_400,h_400,f_auto,q_auto,g_auto/v1/sample.jpg
 */
export function getOptimizedCloudinaryUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url || typeof url !== "string") return "";

  // Verify URL is a valid Cloudinary image delivery URL
  const uploadIndex = url.indexOf("/image/upload/");
  if (uploadIndex === -1) {
    return url;
  }

  const {
    width,
    height,
    crop = "fill",
    format = "auto",
    quality = "auto",
    gravity,
  } = options;

  const transformations: string[] = [];

  if (crop) transformations.push(`c_${crop}`);
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (format) transformations.push(`f_${format}`);
  if (quality) transformations.push(`q_${quality}`);
  if (gravity) transformations.push(`g_${gravity}`);

  if (transformations.length === 0) {
    return url;
  }

  const transformSegment = transformations.join(",");
  const prefix = url.substring(0, uploadIndex + "/image/upload/".length);
  const rest = url.substring(uploadIndex + "/image/upload/".length);

  // Avoid duplicating transformations if already transformed
  if (rest.startsWith("c_") || rest.startsWith("w_") || rest.startsWith("f_auto")) {
    return url;
  }

  return `${prefix}${transformSegment}/${rest}`;
}

/**
 * Returns a 400x400 responsive, optimized square thumbnail suitable for media library cards and grids.
 */
export function getMediaThumbnailUrl(url: string | null | undefined): string {
  return getOptimizedCloudinaryUrl(url, {
    width: 400,
    height: 400,
    crop: "fill",
    format: "auto",
    quality: "auto",
    gravity: "auto",
  });
}

/**
 * Returns a high-definition preview URL (max width 1200, fit/limit) for the detail/preview modal.
 */
export function getMediaPreviewUrl(url: string | null | undefined): string {
  return getOptimizedCloudinaryUrl(url, {
    width: 1200,
    crop: "limit",
    format: "auto",
    quality: "auto",
  });
}
