import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TourGallery } from "./tour-gallery";
import { Tour } from "../types/tour";

vi.mock("next/image", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("react");
  return {
    __esModule: true,
    default: (props: any) =>
      mod.createElement("img", {
        src: props.src,
        alt: props.alt,
        "data-testid": "gallery-img",
      }),
  };
});

function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "t1",
    slug: "t1",
    title: "Test Tour",
    description: "desc",
    categoryId: "c",
    featuredImage: "https://img/cover.jpg",
    images: [],
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    tourType: "island-tours",
    price: { amount: 120, currency: "USD", hasPrice: true },
    ...overrides,
  };
}

describe("TourGallery", () => {
  it("renders the cover image and thumbnail previews in order", () => {
    const tour = makeTour({
      featuredImage: "https://img/cover.jpg",
      images: [
        "https://img/cover.jpg",
        "https://img/2.jpg",
        "https://img/3.jpg",
        "https://img/4.jpg",
        "https://img/5.jpg",
        "https://img/6.jpg",
        "https://img/7.jpg",
      ],
    });
    render(<TourGallery tour={tour} onImageClick={vi.fn()} />);

    // Cover renders
    const cover = screen.getByRole("button", {
      name: "Open tour photo in full screen",
    });
    expect(cover).toBeInTheDocument();

    // 7 thumbnails in the horizontal strip (all 7, below MAX_THUMBS of 8)
    const thumbs = screen.getAllByRole("button", { name: /View photo \d/ });
    expect(thumbs).toHaveLength(7);
  });

  it("shows a +N Photos overlay on the last thumbnail when there are more than 8 images", () => {
    const tour = makeTour({
      featuredImage: "https://img/cover.jpg",
      images: Array.from(
        { length: 10 },
        (_, i) => `https://img/${i + 1}.jpg`
      ),
    });
    render(<TourGallery tour={tour} onImageClick={vi.fn()} />);
    // 10 images, 8 shown, overflow = 2
    expect(screen.getByText("2 Photos")).toBeInTheDocument();
  });

  it("does NOT show the overlay when there are 8 or fewer images", () => {
    const tour = makeTour({
      images: Array.from({ length: 6 }, (_, i) => `https://img/${i + 1}.jpg`),
    });
    render(<TourGallery tour={tour} onImageClick={vi.fn()} />);
    expect(screen.queryByText(/Photos$/)).toBeNull();
  });

  it("calls onImageClick with the correct index when a thumbnail is clicked", () => {
    const onImageClick = vi.fn();
    const tour = makeTour({
      images: [
        "https://img/1.jpg",
        "https://img/2.jpg",
        "https://img/3.jpg",
        "https://img/4.jpg",
      ],
    });
    const { unmount } = render(
      <TourGallery tour={tour} onImageClick={onImageClick} />
    );
    const btns = screen.getAllByRole("button", { name: "View photo 3" });
    btns[0].click();
    expect(onImageClick).toHaveBeenCalledWith(2);
    unmount();
  });

  it("renders the cover alone when only one image exists (no thumbnail row)", () => {
    const tour = makeTour({
      featuredImage: "https://img/only.jpg",
      images: ["https://img/only.jpg"],
    });
    const { container } = render(
      <TourGallery tour={tour} onImageClick={vi.fn()} />
    );
    // Only the cover button; no "View photo N" thumbnails
    expect(
      screen.getByRole("button", { name: "Open tour photo in full screen" })
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /View photo/ })).toBeNull();
    // No thumbnail row content
    expect(container.querySelectorAll("[data-testid='gallery-img']").length).toBe(
      1
    );
  });

  it("stacks the cover above the thumbnail row (no side-by-side layout)", () => {
    const tour = makeTour({
      featuredImage: "https://img/cover.jpg",
      images: [
        "https://img/cover.jpg",
        "https://img/2.jpg",
        "https://img/3.jpg",
        "https://img/4.jpg",
      ],
    });
    const { container } = render(
      <TourGallery tour={tour} onImageClick={vi.fn()} />
    );
    const cover = screen.getByRole("button", {
      name: "Open tour photo in full screen",
    });
    const firstThumb = screen.getByRole("button", { name: "View photo 1" });
    const coverRect = (cover as HTMLElement).getBoundingClientRect();
    const thumbRect = (firstThumb as HTMLElement).getBoundingClientRect();
    // Thumbnail top must be at or below the cover bottom (vertically stacked)
    expect(thumbRect.top).toBeGreaterThanOrEqual(coverRect.bottom - 1);
    void container;
  });
});
