import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  validateMediaFile,
  formatBytes,
  uploadToCloudinaryWithProgress,
  MAX_FILE_SIZE_BYTES,
} from "./cloudinary-upload";
import type { UploadSignatureResponseData } from "../types/admin-media";

describe("cloudinary-upload utils", () => {
  describe("validateMediaFile", () => {
    it("accepts valid image files under 10MB", () => {
      const validJpeg = new File(["dummy content"], "photo.jpg", { type: "image/jpeg" });
      const validPng = new File(["dummy content"], "photo.png", { type: "image/png" });
      const validWebp = new File(["dummy content"], "photo.webp", { type: "image/webp" });
      const validAvif = new File(["dummy content"], "photo.avif", { type: "image/avif" });

      expect(validateMediaFile(validJpeg).valid).toBe(true);
      expect(validateMediaFile(validPng).valid).toBe(true);
      expect(validateMediaFile(validWebp).valid).toBe(true);
      expect(validateMediaFile(validAvif).valid).toBe(true);
    });

    it("rejects unsupported file formats like pdf, gif, svg", () => {
      const pdf = new File(["dummy content"], "document.pdf", { type: "application/pdf" });
      const gif = new File(["dummy content"], "animation.gif", { type: "image/gif" });
      const txt = new File(["dummy content"], "notes.txt", { type: "text/plain" });

      const pdfRes = validateMediaFile(pdf);
      expect(pdfRes.valid).toBe(false);
      expect(pdfRes.error).toContain("Unsupported file format");

      const gifRes = validateMediaFile(gif);
      expect(gifRes.valid).toBe(false);

      const txtRes = validateMediaFile(txt);
      expect(txtRes.valid).toBe(false);
    });

    it("rejects files exceeding 10MB", () => {
      // Create a fake large file object by defining size property
      const largeFile = new File([""], "huge.jpg", { type: "image/jpeg" });
      Object.defineProperty(largeFile, "size", {
        value: MAX_FILE_SIZE_BYTES + 1024,
      });

      const res = validateMediaFile(largeFile);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("exceeds the maximum limit of 10MB");
    });
  });

  describe("formatBytes", () => {
    it("formats 0 bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
    });

    it("formats kilobytes and megabytes correctly", () => {
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1024 * 512)).toBe("512 KB");
      expect(formatBytes(1024 * 1024 * 2.5)).toBe("2.5 MB");
    });
  });

  describe("uploadToCloudinaryWithProgress", () => {
    const mockSignatureData: UploadSignatureResponseData = {
      signature: "test-sig",
      timestamp: 1774872000,
      apiKey: "test-api-key",
      cloudName: "demo-cloud",
      folder: "phukettours/tours",
      publicId: "phukettours/tours/abc-123",
      uploadUrl: "https://api.cloudinary.com/v1_1/demo-cloud/image/upload",
      maxFileSize: 10485760,
      allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
      uploadToken: "tok-123",
    };

    let originalXHR: typeof globalThis.XMLHttpRequest;

    beforeEach(() => {
      originalXHR = globalThis.XMLHttpRequest;
    });

    afterEach(() => {
      globalThis.XMLHttpRequest = originalXHR;
      vi.restoreAllMocks();
    });

    it("successfully uploads directly to Cloudinary with all required parameters and tracks progress", async () => {
      const file = new File(["test image bytes"], "beach.jpg", { type: "image/jpeg" });
      const progressCalls: number[] = [];

      class MockXHR {
        upload = {
          onprogress: null as ((e: { lengthComputable: boolean; loaded: number; total: number }) => void) | null,
        };
        status = 200;
        responseText = JSON.stringify({
          asset_id: "cld-asset-123",
          public_id: "phukettours/tours/abc-123",
          secure_url: "https://res.cloudinary.com/demo-cloud/image/upload/v1/phukettours/tours/abc-123.jpg",
          bytes: 1024,
          format: "jpg",
          resource_type: "image",
        });
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        ontimeout: (() => void) | null = null;

        openedUrl = "";
        sentFormData: FormData | null = null;

        open(method: string, url: string) {
          this.openedUrl = url;
        }

        send(formData: FormData) {
          this.sentFormData = formData;
          // Simulate progress event
          if (this.upload.onprogress) {
            this.upload.onprogress({ lengthComputable: true, loaded: 512, total: 1024 });
          }
          // Simulate onload
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
      }

      globalThis.XMLHttpRequest = MockXHR as unknown as typeof XMLHttpRequest;

      const result = await uploadToCloudinaryWithProgress(file, mockSignatureData, (pct) => {
        progressCalls.push(pct);
      });

      expect(result.public_id).toBe("phukettours/tours/abc-123");
      expect(result.asset_id).toBe("cld-asset-123");
      expect(progressCalls).toContain(50);
      expect(progressCalls).toContain(100);
    });

    it("rejects on Cloudinary API error response", async () => {
      const file = new File(["test image bytes"], "beach.jpg", { type: "image/jpeg" });

      class MockFailingXHR {
        upload = { onprogress: null };
        status = 400;
        responseText = JSON.stringify({
          error: { message: "Invalid Signature 12345" },
        });
        onload: (() => void) | null = null;

        open() {}
        send() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 10);
        }
      }

      globalThis.XMLHttpRequest = MockFailingXHR as unknown as typeof XMLHttpRequest;

      await expect(
        uploadToCloudinaryWithProgress(file, mockSignatureData)
      ).rejects.toThrow("Invalid Signature 12345");
    });
  });
});
