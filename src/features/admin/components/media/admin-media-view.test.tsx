import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AdminMediaView } from "./admin-media-view";
import * as mediaApiModule from "../../api/admin-media-api";
import type { MediaItem } from "../../types/admin-media";

vi.mock("../../api/admin-media-api", () => {
  return {
    useGetAdminMediaQuery: vi.fn(),
    useDeleteAdminMediaMutation: vi.fn(),
    useCreateUploadSignatureMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
    useConfirmUploadedMediaMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  };
});

const MOCK_MEDIA_ITEMS: MediaItem[] = [
  {
    id: "media-1",
    assetId: "cld-1",
    publicId: "phukettours/tours/phi-phi-bay",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/phi-phi.jpg",
    originalFilename: "phi-phi-bay.jpg",
    format: "jpg",
    resourceType: "image",
    width: 1920,
    height: 1080,
    bytes: 256000,
    folder: "phukettours/tours",
    uploadedById: "admin-1",
    serviceId: "tour-101",
    createdAt: "2026-03-30T10:00:00.000Z",
    updatedAt: "2026-03-30T10:00:00.000Z",
    service: {
      id: "tour-101",
      name: "Phi Phi Island Speedboat Adventure",
      type: "TOUR",
    },
  },
  {
    id: "media-2",
    assetId: "cld-2",
    publicId: "phukettours/tours/sunset-beach",
    secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/sunset.png",
    originalFilename: "sunset-beach.png",
    format: "png",
    resourceType: "image",
    width: 1280,
    height: 720,
    bytes: 512000,
    folder: "phukettours/tours",
    uploadedById: "admin-1",
    serviceId: null,
    createdAt: "2026-03-30T11:00:00.000Z",
    updatedAt: "2026-03-30T11:00:00.000Z",
    service: null,
  },
];

type MediaQueryReturn = ReturnType<typeof mediaApiModule.useGetAdminMediaQuery>;
type MediaDeleteReturn = ReturnType<typeof mediaApiModule.useDeleteAdminMediaMutation>[1];

describe("AdminMediaView component", () => {
  const mockRefetch = vi.fn();
  const mockDeleteMedia = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(mediaApiModule.useDeleteAdminMediaMutation).mockReturnValue([
      mockDeleteMedia,
      { isLoading: false, reset: vi.fn() } as unknown as MediaDeleteReturn,
    ]);
  });

  it("renders page header with title, description, and total asset count", () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          items: MOCK_MEDIA_ITEMS,
          pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    render(<AdminMediaView />);

    expect(screen.getByText("Media Library")).toBeInTheDocument();
    expect(
      screen.getByText(/Manage, upload, and inspect media assets/i)
    ).toBeInTheDocument();
    expect(screen.getByTestId("media-total-count-badge")).toHaveTextContent("2 Assets");
    expect(screen.getByTestId("open-upload-modal-button")).toBeInTheDocument();
  });

  it("renders loading skeleton while data is fetching", () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    render(<AdminMediaView />);

    expect(screen.getByTestId("media-loading-skeleton")).toBeInTheDocument();
  });

  it("renders error state and triggers retry when requested", () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
      isError: true,
      error: { status: 500, data: { message: "Internal server error" } },
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    render(<AdminMediaView />);

    expect(screen.getByTestId("media-error-state")).toBeInTheDocument();
    expect(screen.getByText("Internal server error")).toBeInTheDocument();

    const retryBtn = screen.getByTestId("media-retry-btn");
    fireEvent.click(retryBtn);
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("renders empty state when no media exists in the library", () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          items: [],
          pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    render(<AdminMediaView />);

    expect(screen.getByTestId("media-empty-db-state")).toBeInTheDocument();
    expect(screen.getByText("No media uploaded yet")).toBeInTheDocument();
  });

  it("renders media cards with metadata and supports selection", () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          items: MOCK_MEDIA_ITEMS,
          pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    render(<AdminMediaView />);

    expect(screen.getByText("phi-phi-bay.jpg")).toBeInTheDocument();
    expect(screen.getByText("sunset-beach.png")).toBeInTheDocument();
    expect(screen.getAllByText("Attached").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unattached").length).toBeGreaterThan(0);

    // Select single item
    const checkbox1 = screen.getByTestId("media-checkbox-media-1");
    fireEvent.click(checkbox1);

    expect(screen.getByTestId("media-selected-count-badge")).toHaveTextContent("1 selected");

    // Click select all
    const selectAllBtn = screen.getByTestId("media-select-all-btn");
    fireEvent.click(selectAllBtn);

    expect(screen.getByTestId("media-selected-count-badge")).toHaveTextContent("2 selected");
  });

  it("opens details modal and blocks deletion with HTTP 409 when media is referenced by tours", async () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          items: MOCK_MEDIA_ITEMS,
          pagination: { page: 1, limit: 12, total: 2, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    mockDeleteMedia.mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({
        status: 409,
        data: {
          message:
            "Cannot delete media: it is currently referenced by one or more services",
        },
      }),
    });

    render(<AdminMediaView />);

    // Click preview button to open preview
    const previewBtn = screen.getByTestId("media-preview-btn-media-1");
    fireEvent.click(previewBtn);

    const dialogs = screen.queryAllByRole("dialog");
    expect(dialogs.length).toBeGreaterThan(0);

    // Trigger delete
    const triggerDeleteBtn = screen.getByTestId("media-trigger-delete-btn");
    fireEvent.click(triggerDeleteBtn);

    // Confirm delete
    const confirmDeleteBtn = screen.getByTestId("media-confirm-delete-btn");
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId("media-delete-error")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Cannot delete media: it is currently referenced by one or more services/i
        )
      ).toBeInTheDocument();
    });
  });

  it("handles successful deletion and refreshes media query", async () => {
    vi.mocked(mediaApiModule.useGetAdminMediaQuery).mockReturnValue({
      data: {
        success: true,
        message: "ok",
        data: {
          items: [MOCK_MEDIA_ITEMS[1]], // unattached item
          pagination: { page: 1, limit: 12, total: 1, totalPages: 1 },
        },
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mockRefetch,
    } as unknown as MediaQueryReturn);

    mockDeleteMedia.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        message: "Media record deleted successfully",
        data: { id: "media-2", publicId: "phukettours/tours/sunset-beach" },
      }),
    });

    render(<AdminMediaView />);

    const previewBtn = screen.getByTestId("media-preview-btn-media-2");
    fireEvent.click(previewBtn);

    await waitFor(() => {
      expect(screen.getByText("Media Details")).toBeInTheDocument();
    });

    const triggerDeleteBtn = screen.getByTestId("media-trigger-delete-btn");
    fireEvent.click(triggerDeleteBtn);

    const confirmDeleteBtn = screen.getByTestId("media-confirm-delete-btn");
    fireEvent.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(mockDeleteMedia).toHaveBeenCalledWith("media-2");
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
