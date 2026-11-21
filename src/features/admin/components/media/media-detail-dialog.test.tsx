import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MediaDetailDialog } from "./media-detail-dialog";
import * as mediaApiModule from "../../api/admin-media-api";
import type { MediaItem } from "../../types/admin-media";

vi.mock("../../api/admin-media-api", () => {
  return {
    useDeleteAdminMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useSyncAdminMediaAssetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

const MOCK_ITEM: MediaItem = {
  id: "item-123",
  assetId: "cld-123",
  publicId: "phukettours/tours/sample",
  secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
  originalFilename: "sample.jpg",
  format: "jpg",
  resourceType: "image",
  width: 1920,
  height: 1080,
  bytes: 500000,
  folder: "phukettours/tours",
  uploadedById: "admin-1",
  serviceId: null,
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
};

describe("MediaDetailDialog component", () => {
  it("renders metadata and sync button", () => {
    render(
      <MediaDetailDialog
        item={MOCK_ITEM}
        isOpen={true}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText("sample.jpg")).toBeInTheDocument();
    expect(screen.getByTestId("media-sync-metadata-btn")).toBeInTheDocument();
    expect(screen.getByTestId("media-trigger-delete-btn")).toBeInTheDocument();
  });

  it("triggers sync metadata mutation and displays success state", async () => {
    const mockSyncTrigger = vi.fn().mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { media: MOCK_ITEM, status: "synced" },
      }),
    });
    vi.mocked(mediaApiModule.useSyncAdminMediaAssetMutation).mockReturnValue([
      mockSyncTrigger,
      { isLoading: false },
    ] as any);

    const onUpdated = vi.fn();

    render(
      <MediaDetailDialog
        item={MOCK_ITEM}
        isOpen={true}
        onClose={vi.fn()}
        onUpdated={onUpdated}
      />
    );

    const syncBtn = screen.getByTestId("media-sync-metadata-btn");
    fireEvent.click(syncBtn);

    expect(mockSyncTrigger).toHaveBeenCalledWith("item-123");
    await waitFor(() => {
      expect(screen.getByTestId("media-sync-success")).toBeInTheDocument();
      expect(screen.getByText("Metadata successfully synchronized with Cloudinary.")).toBeInTheDocument();
      expect(onUpdated).toHaveBeenCalled();
    });
  });
});
