import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaCard } from "./media-card";
import type { MediaItem } from "../../types/admin-media";

const MOCK_ITEM: MediaItem = {
  id: "card-item-1",
  assetId: "cld-asset-1",
  publicId: "phukettours/tours/emerald-pool",
  secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/emerald.jpg",
  originalFilename: "emerald-pool.jpg",
  format: "jpg",
  resourceType: "image",
  width: 1920,
  height: 1080,
  bytes: 1048576, // 1 MB
  folder: "phukettours/tours",
  uploadedById: "admin-1",
  serviceId: "tour-99",
  createdAt: "2026-03-30T10:00:00.000Z",
  updatedAt: "2026-03-30T10:00:00.000Z",
  service: {
    id: "tour-99",
    name: "Krabi Emerald Pool Tour",
    type: "TOUR",
  },
};

describe("MediaCard component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders image thumbnail, original filename, dimensions, format, and size", () => {
    render(<MediaCard item={MOCK_ITEM} />);

    expect(screen.getByText("emerald-pool.jpg")).toBeInTheDocument();
    expect(screen.getByText("1920 × 1080")).toBeInTheDocument();
    expect(screen.getByText("1 MB")).toBeInTheDocument();
    expect(screen.getByText("jpg")).toBeInTheDocument();
    expect(screen.getByText("Attached")).toBeInTheDocument();
  });

  it("triggers selection toggle when clicking the checkbox", () => {
    const onToggleSelect = vi.fn();
    render(<MediaCard item={MOCK_ITEM} isSelected={false} onToggleSelect={onToggleSelect} />);

    const checkbox = screen.getByTestId("media-checkbox-card-item-1");
    fireEvent.click(checkbox);

    expect(onToggleSelect).toHaveBeenCalledWith(MOCK_ITEM);
  });

  it("copies image URL to clipboard when clicking copy button", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(<MediaCard item={MOCK_ITEM} />);

    const copyBtn = screen.getByTestId("media-copy-btn-card-item-1");
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith(MOCK_ITEM.secureUrl);
  });

  it("calls onDelete when clicking the delete button", () => {
    const onDelete = vi.fn();
    render(<MediaCard item={MOCK_ITEM} onDelete={onDelete} />);

    const deleteBtn = screen.getByTestId("media-delete-btn-card-item-1");
    fireEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(MOCK_ITEM);
  });

  it("calls onPreview when clicking preview button or card surface", () => {
    const onPreview = vi.fn();
    render(<MediaCard item={MOCK_ITEM} onPreview={onPreview} />);

    const previewBtn = screen.getByTestId("media-preview-btn-card-item-1");
    fireEvent.click(previewBtn);

    expect(onPreview).toHaveBeenCalledWith(MOCK_ITEM);
  });
});
