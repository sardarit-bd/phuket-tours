import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MediaGalleryManager } from "./media-gallery-manager";
import type { GalleryImage, MediaItem } from "../../types/admin-media";

const MOCK_GALLERY: GalleryImage[] = [
  {
    id: "img-1",
    url: "https://res.cloudinary.com/demo/image/upload/v1/island-1.jpg",
    publicId: "phukettours/tours/island-1",
    isCover: true,
  },
  {
    id: "img-2",
    url: "https://res.cloudinary.com/demo/image/upload/v1/island-2.jpg",
    publicId: "phukettours/tours/island-2",
    isCover: false,
  },
  {
    id: "img-3",
    url: "https://res.cloudinary.com/demo/image/upload/v1/island-3.jpg",
    publicId: "phukettours/tours/island-3",
    isCover: false,
  },
];

const MOCK_AVAILABLE_MEDIA: MediaItem[] = [
  {
    id: "med-new-10",
    assetId: "cld-10",
    publicId: "phukettours/tours/new-photo",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/new-photo.jpg",
    originalFilename: "new-photo.jpg",
    format: "jpg",
    resourceType: "image",
    width: 1920,
    height: 1080,
    bytes: 409600,
    folder: "phukettours/tours",
    uploadedById: "admin-1",
    serviceId: null,
    createdAt: "2026-03-30T10:00:00.000Z",
    updatedAt: "2026-03-30T10:00:00.000Z",
  },
];

describe("MediaGalleryManager component", () => {
  it("renders empty state when no gallery images are passed", () => {
    render(<MediaGalleryManager images={[]} />);

    expect(screen.getByTestId("gallery-empty-state")).toBeInTheDocument();
    expect(
      screen.getByText("No gallery images selected")
    ).toBeInTheDocument();
  });

  it("renders gallery images with their ordering badges and cover badge", () => {
    render(<MediaGalleryManager images={MOCK_GALLERY} />);

    expect(screen.getByTestId("gallery-grid")).toBeInTheDocument();
    expect(screen.getByText("#1")).toBeInTheDocument();
    expect(screen.getByText("#2")).toBeInTheDocument();
    expect(screen.getByText("#3")).toBeInTheDocument();

    // First item is cover
    expect(screen.getByTestId("gallery-cover-badge-0")).toBeInTheDocument();
    expect(screen.getByText("Cover Image")).toBeInTheDocument();
  });

  it("allows designating a different image as the cover", () => {
    const onChange = vi.fn();
    render(<MediaGalleryManager images={MOCK_GALLERY} onChange={onChange} />);

    // Click 'Set Cover' on the second image (#2)
    const setCoverBtn = screen.getByTestId("gallery-set-cover-btn-1");
    fireEvent.click(setCoverBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updatedGallery: GalleryImage[] = onChange.mock.calls[0][0];
    expect(updatedGallery[0].isCover).toBe(false);
    expect(updatedGallery[1].isCover).toBe(true);
  });

  it("reorders images when moving left or right", () => {
    const onChange = vi.fn();
    render(<MediaGalleryManager images={MOCK_GALLERY} onChange={onChange} />);

    // Move item #2 to the left (target index 0)
    const moveLeftBtn = screen.getByTestId("gallery-move-left-1");
    fireEvent.click(moveLeftBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updatedGallery: GalleryImage[] = onChange.mock.calls[0][0];
    expect(updatedGallery[0].id).toBe("img-2");
    expect(updatedGallery[1].id).toBe("img-1");
  });

  it("removes an image from the gallery and promotes next item if cover was removed", () => {
    const onChange = vi.fn();
    render(<MediaGalleryManager images={MOCK_GALLERY} onChange={onChange} />);

    // Remove cover item (#0)
    const removeBtn = screen.getByTestId("gallery-remove-btn-0");
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updatedGallery: GalleryImage[] = onChange.mock.calls[0][0];
    expect(updatedGallery.length).toBe(2);
    expect(updatedGallery[0].id).toBe("img-2");
    expect(updatedGallery[0].isCover).toBe(true);
  });

  it("allows replacing an image slot with a media item from the library", async () => {
    const onChange = vi.fn();
    render(
      <MediaGalleryManager
        images={MOCK_GALLERY}
        onChange={onChange}
        availableMedia={MOCK_AVAILABLE_MEDIA}
      />
    );

    // Click replace on item #1
    const replaceBtn = screen.getByTestId("gallery-replace-btn-1");
    fireEvent.click(replaceBtn);

    // Dialog opens with available media items
    await waitFor(() => {
      expect(screen.getByTestId("picker-item-med-new-10")).toBeInTheDocument();
    });

    // Pick the new media item
    const pickerItem = screen.getByTestId("picker-item-med-new-10");
    fireEvent.click(pickerItem);

    expect(onChange).toHaveBeenCalledTimes(1);
    const updatedGallery: GalleryImage[] = onChange.mock.calls[0][0];
    expect(updatedGallery[1].id).toBe("med-new-10");
    expect(updatedGallery[1].url).toBe(MOCK_AVAILABLE_MEDIA[0].secureUrl);
  });
});
