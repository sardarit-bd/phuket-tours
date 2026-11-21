import { describe, it, expect } from "vitest";
import {
  getOptimizedCloudinaryUrl,
  getMediaThumbnailUrl,
  getMediaPreviewUrl,
} from "./cloudinary-url";

describe("cloudinary-url utility", () => {
  const sampleUrl = "https://res.cloudinary.com/dg83pvgls/image/upload/v123456789/phukettours/tours/sample.jpg";

  it("returns original URL for empty or non-string inputs", () => {
    expect(getOptimizedCloudinaryUrl("")).toBe("");
    expect(getOptimizedCloudinaryUrl(undefined)).toBe("");
  });

  it("returns original URL if not a Cloudinary image upload URL", () => {
    const externalUrl = "https://images.unsplash.com/photo-12345";
    expect(getOptimizedCloudinaryUrl(externalUrl)).toBe(externalUrl);
  });

  it("inserts transformation parameters correctly into Cloudinary URL", () => {
    const transformed = getOptimizedCloudinaryUrl(sampleUrl, {
      width: 300,
      height: 300,
      crop: "fill",
      format: "auto",
      quality: "auto",
    });

    expect(transformed).toBe(
      "https://res.cloudinary.com/dg83pvgls/image/upload/c_fill,w_300,h_300,f_auto,q_auto/v123456789/phukettours/tours/sample.jpg"
    );
  });

  it("generates correct thumbnail URL using getMediaThumbnailUrl", () => {
    const thumb = getMediaThumbnailUrl(sampleUrl);
    expect(thumb).toBe(
      "https://res.cloudinary.com/dg83pvgls/image/upload/c_fill,w_400,h_400,f_auto,q_auto,g_auto/v123456789/phukettours/tours/sample.jpg"
    );
  });

  it("generates correct preview URL using getMediaPreviewUrl", () => {
    const preview = getMediaPreviewUrl(sampleUrl);
    expect(preview).toBe(
      "https://res.cloudinary.com/dg83pvgls/image/upload/c_limit,w_1200,f_auto,q_auto/v123456789/phukettours/tours/sample.jpg"
    );
  });

  it("does not duplicate transformations if already present", () => {
    const alreadyTransformed =
      "https://res.cloudinary.com/dg83pvgls/image/upload/c_fill,w_400/v1/sample.jpg";
    expect(getMediaThumbnailUrl(alreadyTransformed)).toBe(alreadyTransformed);
  });
});
