import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MediaUploader } from "./media-uploader";
import * as mediaApiModule from "../../api/admin-media-api";
import * as cloudinaryUploadModule from "../../utils/cloudinary-upload";

vi.mock("../../api/admin-media-api", () => {
  return {
    useCreateUploadSignatureMutation: vi.fn(),
    useConfirmUploadedMediaMutation: vi.fn(),
  };
});

describe("MediaUploader component", () => {
  const mockCreateSignature = vi.fn();
  const mockConfirmMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(mediaApiModule.useCreateUploadSignatureMutation).mockReturnValue([
      mockCreateSignature,
      { isLoading: false, reset: vi.fn() } as unknown as ReturnType<
        typeof mediaApiModule.useCreateUploadSignatureMutation
      >[1],
    ]);

    vi.mocked(mediaApiModule.useConfirmUploadedMediaMutation).mockReturnValue([
      mockConfirmMedia,
      { isLoading: false, reset: vi.fn() } as unknown as ReturnType<
        typeof mediaApiModule.useConfirmUploadedMediaMutation
      >[1],
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders drag-and-drop zone with guidelines", () => {
    render(<MediaUploader />);

    expect(
      screen.getByText("Click to upload or drag and drop images")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/JPEG, PNG, WebP, AVIF up to 10MB each/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("media-dropzone")).toBeInTheDocument();
  });

  it("validates file type and displays error for unsupported files", async () => {
    render(<MediaUploader />);

    const invalidFile = new File(["dummy text"], "document.pdf", {
      type: "application/pdf",
    });

    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText("document.pdf")).toBeInTheDocument();
      expect(
        screen.getByText(/Unsupported file format/i)
      ).toBeInTheDocument();
    });
  });

  it("validates file size and flags files larger than 10MB", async () => {
    render(<MediaUploader />);

    const largeFile = new File([""], "huge-image.jpg", { type: "image/jpeg" });
    Object.defineProperty(largeFile, "size", {
      value: 11 * 1024 * 1024,
    });

    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText("huge-image.jpg")).toBeInTheDocument();
      expect(
        screen.getByText(/exceeds the maximum limit of 10MB/i)
      ).toBeInTheDocument();
    });
  });

  it("allows removing queued files", async () => {
    render(<MediaUploader />);

    const validFile = new File(["photo"], "beach.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText("beach.jpg")).toBeInTheDocument();
    });

    const removeBtn = screen.getByLabelText("Remove item from queue");
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(screen.queryByText("beach.jpg")).not.toBeInTheDocument();
    });
  });

  it("executes the full signature, upload, and confirmation flow", async () => {
    const onUploadSuccess = vi.fn();

    // Mock signature response
    mockCreateSignature.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          signature: "valid-sig",
          timestamp: 1774872000,
          apiKey: "api-key",
          cloudName: "cloud",
          folder: "phukettours/tours",
          publicId: "phukettours/tours/sample-1",
          uploadUrl: "https://api.cloudinary.com/upload",
          maxFileSize: 10485760,
          allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
          uploadToken: "tok-1",
        },
      }),
    });

    // Mock direct Cloudinary upload
    vi.spyOn(cloudinaryUploadModule, "uploadToCloudinaryWithProgress").mockResolvedValue({
      asset_id: "cld-asset-1",
      public_id: "phukettours/tours/sample-1",
      secure_url: "https://res.cloudinary.com/demo/image/upload/v1/sample-1.jpg",
      bytes: 2048,
      format: "jpg",
      resource_type: "image",
    });

    // Mock confirmation response
    mockConfirmMedia.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "med-1",
          assetId: "cld-asset-1",
          publicId: "phukettours/tours/sample-1",
          secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample-1.jpg",
          originalFilename: "island.jpg",
          format: "jpg",
          resourceType: "image",
          bytes: 2048,
          folder: "phukettours/tours",
          uploadedById: "admin-1",
          serviceId: null,
          createdAt: "2026-03-30T10:00:00.000Z",
          updatedAt: "2026-03-30T10:00:00.000Z",
        },
      }),
    });

    render(<MediaUploader onUploadSuccess={onUploadSuccess} />);

    const validFile = new File(["dummy image"], "island.jpg", { type: "image/jpeg" });
    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText("island.jpg")).toBeInTheDocument();
    });

    const uploadAllBtn = screen.getByTestId("upload-all-queued-btn");
    fireEvent.click(uploadAllBtn);

    await waitFor(() => {
      expect(mockCreateSignature).toHaveBeenCalledWith({});
      expect(mockConfirmMedia).toHaveBeenCalledWith({
        publicId: "phukettours/tours/sample-1",
        uploadToken: "tok-1",
        assetId: "cld-asset-1",
      });
      expect(onUploadSuccess).toHaveBeenCalled();
      expect(screen.getByText("Uploaded")).toBeInTheDocument();
    });
  });

  it("handles HTTP 503 Cloudinary unconfigured error gracefully with clear notice", async () => {
    mockCreateSignature.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 503,
        data: {
          message: "Cloudinary is not configured. Missing required environment variables.",
        },
      }),
    });

    render(<MediaUploader />);

    const validFile = new File(["dummy image"], "sunset.png", { type: "image/png" });
    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText("sunset.png")).toBeInTheDocument();
    });

    const uploadAllBtn = screen.getByTestId("upload-all-queued-btn");
    fireEvent.click(uploadAllBtn);

    await waitFor(() => {
      expect(screen.getByTestId("backend-config-warning")).toBeInTheDocument();
      expect(
        screen.getByText(/Backend Cloudinary Configuration Notice/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Cloudinary is not configured on backend/i)
      ).toBeInTheDocument();
    });
  });

  it("supports retrying failed uploads", async () => {
    // First call rejects, second call succeeds
    mockCreateSignature
      .mockReturnValueOnce({
        unwrap: vi.fn().mockRejectedValueOnce(new Error("Network timeout")),
      })
      .mockReturnValueOnce({
        unwrap: vi.fn().mockResolvedValue({
          success: true,
          data: {
            signature: "sig-2",
            timestamp: 1774872000,
            apiKey: "key",
            cloudName: "cloud",
            folder: "phukettours/tours",
            publicId: "phukettours/tours/retry-item",
            uploadUrl: "https://api.cloudinary.com/upload",
            maxFileSize: 10485760,
            allowedFormats: ["jpg", "jpeg", "png", "webp", "avif"],
            uploadToken: "tok-retry",
          },
        }),
      });

    vi.spyOn(cloudinaryUploadModule, "uploadToCloudinaryWithProgress").mockResolvedValue({
      asset_id: "cld-retry",
      public_id: "phukettours/tours/retry-item",
      secure_url: "https://res.cloudinary.com/retry.jpg",
      bytes: 1024,
      format: "jpg",
      resource_type: "image",
    });

    mockConfirmMedia.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: {
          id: "med-retry",
          publicId: "phukettours/tours/retry-item",
        },
      }),
    });

    render(<MediaUploader />);

    const validFile = new File(["retry image"], "temple.webp", { type: "image/webp" });
    const fileInput = screen.getByTestId("media-file-input");
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(screen.getByText("temple.webp")).toBeInTheDocument();
    });

    const uploadBtn = screen.getByTestId("upload-all-queued-btn");
    fireEvent.click(uploadBtn);

    // After failure, retry button appears
    await waitFor(() => {
      expect(screen.getByText("Network timeout")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });

    // Click retry
    const retryBtn = screen.getByText("Retry");
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Uploaded")).toBeInTheDocument();
    });
  });
});
