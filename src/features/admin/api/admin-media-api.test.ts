import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { adminMediaApi } from "./admin-media-api";
import { makeStore } from "@/store";
import type {
  AdminApiResponse,
  AdminMediaListResponse,
  UploadSignatureResponseData,
  MediaItem,
} from "../types/admin-media";

describe("adminMediaApi RTK Query endpoints", () => {
  const originalFetch = globalThis.fetch;
  let capturedRequest: {
    url: string;
    method: string;
    credentials?: RequestCredentials;
    body?: string;
  } | null = null;

  const setupMockFetch = (status: number, responseBody: unknown) => {
    globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = "";
      let method = "GET";
      let credentials: RequestCredentials | undefined;
      let body = "";

      if (input instanceof Request) {
        url = input.url;
        method = input.method;
        credentials = input.credentials;
        body = await input.clone().text();
      } else {
        url = String(input);
        method = init?.method || "GET";
        credentials = init?.credentials;
        body = init?.body ? String(init.body) : "";
      }

      capturedRequest = { url, method, credentials, body };

      return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => responseBody,
        text: async () => JSON.stringify(responseBody),
        clone() {
          return this;
        },
      } as unknown as Response;
    });
  };

  beforeEach(() => {
    capturedRequest = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe("getAdminMedia query", () => {
    it("dispatches GET /api/v1/admin/media with pagination and filter parameters", async () => {
      const mockData: AdminMediaListResponse = {
        items: [
          {
            id: "media-1",
            assetId: "cld-asset-1",
            publicId: "phukettours/tours/media-1",
            secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/phukettours/tours/media-1.jpg",
            originalFilename: "beach.jpg",
            format: "jpg",
            resourceType: "image",
            width: 1920,
            height: 1080,
            bytes: 204800,
            folder: "phukettours/tours",
            uploadedById: "admin-1",
            serviceId: null,
            createdAt: "2026-03-30T10:00:00.000Z",
            updatedAt: "2026-03-30T10:00:00.000Z",
          },
        ],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      };

      const mockResponse: AdminApiResponse<AdminMediaListResponse> = {
        success: true,
        message: "Media records retrieved successfully",
        data: mockData,
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminMediaApi.endpoints.getAdminMedia.initiate({
          page: 2,
          limit: 12,
          search: "beach",
          unattached: "true",
        })
      );

      expect(result.data).toEqual(mockResponse);
      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");
      expect(capturedRequest?.url).toContain("/admin/media");
      expect(capturedRequest?.url).toContain("page=2");
      expect(capturedRequest?.url).toContain("limit=12");
      expect(capturedRequest?.url).toContain("search=beach");
      expect(capturedRequest?.url).toContain("unattached=true");
    });
  });

  describe("createUploadSignature mutation", () => {
    it("dispatches POST /api/v1/admin/media/signature with batchSize and folder", async () => {
      const mockData: UploadSignatureResponseData = {
        signature: "test-sig-123",
        timestamp: 1774872000,
        apiKey: "123456789",
        cloudName: "demo-cloud",
        folder: "phukettours/tours",
        publicId: "phukettours/tours/auto-gen-id",
        uploadUrl: "https://api.cloudinary.com/v1_1/demo-cloud/image/upload",
        maxFileSize: 10485760,
        allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
        uploadToken: "tok_secure_123",
      };

      const mockResponse: AdminApiResponse<UploadSignatureResponseData> = {
        success: true,
        message: "Upload signature generated successfully",
        data: mockData,
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminMediaApi.endpoints.createUploadSignature.initiate({
          folder: "phukettours/tours",
          batchSize: 5,
        })
      );

      expect(result.data).toEqual(mockResponse);
      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedRequest?.url).toContain("/admin/media/signature");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        folder: "phukettours/tours",
        batchSize: 5,
      });
    });
  });

  describe("confirmUploadedMedia mutation", () => {
    it("dispatches POST /api/v1/admin/media/confirm with publicId and uploadToken", async () => {
      const mockItem: MediaItem = {
        id: "media-new-1",
        assetId: "cld-asset-new",
        publicId: "phukettours/tours/auto-gen-id",
        secureUrl: "https://res.cloudinary.com/demo-cloud/image/upload/v1/phukettours/tours/auto-gen-id.jpg",
        originalFilename: "sunset.png",
        format: "png",
        resourceType: "image",
        width: 1200,
        height: 800,
        bytes: 512000,
        folder: "phukettours/tours",
        uploadedById: "admin-1",
        serviceId: null,
        createdAt: "2026-03-30T11:00:00.000Z",
        updatedAt: "2026-03-30T11:00:00.000Z",
      };

      const mockResponse: AdminApiResponse<MediaItem> = {
        success: true,
        message: "Media confirmed and registered successfully",
        data: mockItem,
      };

      setupMockFetch(201, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminMediaApi.endpoints.confirmUploadedMedia.initiate({
          publicId: "phukettours/tours/auto-gen-id",
          uploadToken: "tok_secure_123",
          assetId: "cld-asset-new",
        })
      );

      expect(result.data).toEqual(mockResponse);
      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedRequest?.url).toContain("/admin/media/confirm");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        publicId: "phukettours/tours/auto-gen-id",
        uploadToken: "tok_secure_123",
        assetId: "cld-asset-new",
      });
    });
  });

  describe("deleteAdminMedia mutation", () => {
    it("dispatches DELETE /api/v1/admin/media/:mediaId", async () => {
      const mockResponse: AdminApiResponse<{ id: string; publicId: string }> = {
        success: true,
        message: "Media record deleted successfully",
        data: { id: "media-to-del", publicId: "phukettours/tours/media-to-del" },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminMediaApi.endpoints.deleteAdminMedia.initiate("media-to-del")
      );

      expect(result.data).toEqual(mockResponse);
      expect(capturedRequest).not.toBeNull();
      expect(capturedRequest?.method).toBe("DELETE");
      expect(capturedRequest?.url).toContain("/admin/media/media-to-del");
    });
  });
});
