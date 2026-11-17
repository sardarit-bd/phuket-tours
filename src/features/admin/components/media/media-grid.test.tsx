import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MediaGrid } from "./media-grid";
import type { MediaItem } from "../../types/admin-media";

const MOCK_ITEMS: MediaItem[] = [
  {
    id: "item-1",
    assetId: "cld-1",
    publicId: "phukettours/tours/similan-1",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/similan.jpg",
    originalFilename: "similan-island.jpg",
    format: "jpg",
    resourceType: "image",
    width: 1920,
    height: 1080,
    bytes: 524288,
    folder: "phukettours/tours",
    uploadedById: "admin-1",
    serviceId: "tour-1",
    createdAt: "2026-03-30T10:00:00.000Z",
    updatedAt: "2026-03-30T10:00:00.000Z",
    service: {
      id: "tour-1",
      name: "Similan Islands Adventure",
      type: "TOUR",
    },
  },
  {
    id: "item-2",
    assetId: "cld-2",
    publicId: "phukettours/tours/phi-phi-2",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/phiphi.png",
    originalFilename: "phi-phi-maya-bay.png",
    format: "png",
    resourceType: "image",
    width: 1280,
    height: 720,
    bytes: 1048576,
    folder: "phukettours/tours",
    uploadedById: "admin-1",
    serviceId: null,
    createdAt: "2026-03-30T11:00:00.000Z",
    updatedAt: "2026-03-30T11:00:00.000Z",
    service: null,
  },
];

describe("MediaGrid component", () => {
  const onToggleSelect = vi.fn();
  const onPreview = vi.fn();
  const onDelete = vi.fn();
  const onRetry = vi.fn();
  const onResetFilters = vi.fn();
  const onOpenUpload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading skeleton with 12 items and compact aspect-square styling", () => {
    render(
      <MediaGrid
        items={[]}
        isLoading={true}
        selectedIds={new Set()}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    );

    const skeleton = screen.getByTestId("media-loading-skeleton");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton.className).toContain("grid-cols-2");
    expect(skeleton.className).toContain("sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]");
    expect(skeleton.children.length).toBe(12);

    // Verify 1:1 aspect ratio on skeleton thumbnail
    const thumb = skeleton.querySelector(".aspect-square");
    expect(thumb).toBeInTheDocument();
  });

  it("renders error state and handles retry", () => {
    render(
      <MediaGrid
        items={[]}
        isError={true}
        errorMessage="Network failure"
        onRetry={onRetry}
        selectedIds={new Set()}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId("media-error-state")).toBeInTheDocument();
    expect(screen.getByText("Network failure")).toBeInTheDocument();

    const retryBtn = screen.getByTestId("media-retry-btn");
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders filtered empty search state with reset button", () => {
    render(
      <MediaGrid
        items={[]}
        isFiltered={true}
        onResetFilters={onResetFilters}
        selectedIds={new Set()}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId("media-empty-search-state")).toBeInTheDocument();
    expect(screen.getByText("No matching media found")).toBeInTheDocument();

    const resetBtn = screen.getByTestId("media-reset-filters-btn");
    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });

  it("renders empty database state with upload button", () => {
    render(
      <MediaGrid
        items={[]}
        isFiltered={false}
        onOpenUpload={onOpenUpload}
        selectedIds={new Set()}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    );

    expect(screen.getByTestId("media-empty-db-state")).toBeInTheDocument();
    expect(screen.getByText("No media uploaded yet")).toBeInTheDocument();

    const uploadBtn = screen.getByTestId("empty-upload-images-btn");
    fireEvent.click(uploadBtn);
    expect(onOpenUpload).toHaveBeenCalledTimes(1);
  });

  it("renders compact responsive grid with media cards and verified classes", () => {
    render(
      <MediaGrid
        items={MOCK_ITEMS}
        selectedIds={new Set(["item-1"])}
        onToggleSelect={onToggleSelect}
        onPreview={onPreview}
        onDelete={onDelete}
      />
    );

    const grid = screen.getByTestId("media-grid");
    expect(grid).toBeInTheDocument();
    expect(grid.className).toContain("grid-cols-2");
    expect(grid.className).toContain("sm:[grid-template-columns:repeat(auto-fill,minmax(180px,1fr))]");
    expect(grid.className).toContain("gap-3");

    // Check media cards rendered
    expect(screen.getByTestId("media-card-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("media-card-item-2")).toBeInTheDocument();

    // Verify 1:1 aspect ratio on thumbnail containers
    const thumbs = grid.querySelectorAll(".aspect-square");
    expect(thumbs.length).toBe(2);

    // Check selection state
    expect(screen.getByTestId("media-checkbox-item-1")).toHaveClass("bg-[#176779]");

    // Check metadata content
    expect(screen.getByText("similan-island.jpg")).toBeInTheDocument();
    expect(screen.getByText("phi-phi-maya-bay.png")).toBeInTheDocument();
    expect(screen.getByText("1920 × 1080")).toBeInTheDocument();
    expect(screen.getByText("1280 × 720")).toBeInTheDocument();
  });
});
