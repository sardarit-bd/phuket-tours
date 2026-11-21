import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AdminMediaView } from "./admin-media-view";
import * as mediaApiModule from "../../api/admin-media-api";
import type { MediaItem } from "../../types/admin-media";

vi.mock("../../api/admin-media-api", () => {
  return {
    useGetAdminMediaQuery: vi.fn(),
    useDeleteAdminMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useBulkDeleteAdminMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useBulkAttachDetachAdminMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useSyncAdminMediaAssetMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useCreateUploadSignatureMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useConfirmUploadedMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

function generateMockItems(count: number): MediaItem[] {
  const items: MediaItem[] = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      id: `media-${i}`,
      assetId: `cld-${i}`,
      publicId: `phukettours/tours/item-${i}`,
      secureUrl: `https://res.cloudinary.com/demo/image/upload/v1/item-${i}.jpg`,
      originalFilename: `item-${i}.jpg`,
      format: "jpg",
      resourceType: "image",
      width: 1920,
      height: 1080,
      bytes: 250000,
      folder: "phukettours/tours",
      uploadedById: "admin-1",
      serviceId: null,
      createdAt: "2026-03-30T10:00:00.000Z",
      updatedAt: "2026-03-30T10:00:00.000Z",
    });
  }
  return items;
}

describe("Media Library Performance Benchmarks", () => {
  const scenarios = [
    { total: 1000, label: "1,000 assets" },
    { total: 5000, label: "5,000 assets" },
    { total: 10000, label: "10,000 assets" },
  ];

  for (const { total, label } of scenarios) {
    it(`renders only current page (24 items) efficiently for dataset of ${label}`, () => {
      const pageLimit = 24;
      const pageItems = generateMockItems(pageLimit);

      vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
        data: {
          success: true,
          message: "ok",
          data: {
            items: pageItems,
            pagination: {
              page: 1,
              limit: pageLimit,
              total,
              totalPages: Math.ceil(total / pageLimit),
            },
          },
        },
        isLoading: false,
        isFetching: false,
        isError: false,
        refetch: vi.fn(),
      } as any);

      const startTime = performance.now();
      const initialMem = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage().heapUsed : 0;

      const { container } = render(<AdminMediaView />);

      const renderDurationMs = performance.now() - startTime;
      const finalMem = typeof process !== "undefined" && process.memoryUsage ? process.memoryUsage().heapUsed : 0;
      const memDeltaKb = Math.round((finalMem - initialMem) / 1024);

      // Verify DOM has exactly 24 card elements rendered, NOT the total dataset
      const renderedCards = container.querySelectorAll("[data-testid^='media-card-']");
      expect(renderedCards.length).toBe(pageLimit);

      // Verify header correctly reflects total assets without rendering them
      expect(screen.getByTestId("media-total-count-badge")).toHaveTextContent(
        `${total.toLocaleString()} Assets`
      );

      // Verify all rendered images use optimized thumbnails
      renderedCards.forEach((card) => {
        const img = card.querySelector("img");
        expect(img).not.toBeNull();
        expect(img?.getAttribute("src")).toContain("c_fill,w_400,h_400,f_auto,q_auto,g_auto");
      });

      console.log(`[Benchmark] ${label}: Render time = ${renderDurationMs.toFixed(2)}ms, DOM nodes = ${renderedCards.length}, Heap delta = ${memDeltaKb} KB`);
      expect(renderDurationMs).toBeLessThan(1000);
    });
  }
});
