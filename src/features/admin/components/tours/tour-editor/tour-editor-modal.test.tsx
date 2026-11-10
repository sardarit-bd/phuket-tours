import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TourEditorModal } from "./tour-editor-modal";
import * as adminApiModule from "../../../api/admin-api";
import type { AdminServiceRecord, AdminServiceDetail } from "../../../types/admin";

vi.mock("../../../api/admin-api", () => {
  return {
    useCreateAdminServiceMutation: vi.fn(),
    useUpdateAdminServiceMutation: vi.fn(),
    useUpdateAdminServiceStatusMutation: vi.fn(),
    useUpdateAdminServicePricingMutation: vi.fn(),
    useUpdateAdminServiceAvailabilityMutation: vi.fn(),
    useGetAdminServiceByIdQuery: vi.fn(),
  };
});

vi.mock("../../../api/admin-media-api", () => {
  return {
    useGetAdminMediaQuery: vi.fn(() => ({
      data: {
        data: {
          items: [
            {
              id: "media-1",
              publicId: "phuket/tours/maya-bay-1",
              secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/maya-bay.jpg",
              originalFilename: "maya-bay.jpg",
              format: "jpg",
              bytes: 1048576,
              width: 1920,
              height: 1080,
              resourceType: "image",
              createdAt: "2026-01-01T00:00:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 36, total: 1, totalPages: 1 },
        },
      },
      isLoading: false,
      refetch: vi.fn(),
    })),
  };
});

const MOCK_EXISTING_TOUR: AdminServiceRecord = {
  id: "tour-999",
  name: "James Bond Island Luxury Catamaran Cruise",
  description: "Sail through Phang Nga Bay aboard a premium catamaran",
  type: "TOUR",
  status: "DRAFT",
  providerName: "Luxury Andaman Cruises",
  providerId: "prov-catamaran",
  metadata: {
    slug: "james-bond-island-luxury-catamaran",
    destination: "Phang Nga Bay",
    duration: "Full Day",
    featuredImage: "https://res.cloudinary.com/demo/image/upload/v1/james-bond.jpg",
    images: ["https://res.cloudinary.com/demo/image/upload/v1/james-bond.jpg"],
    highlights: ["Sea kayaking in sea caves", "James Bond Island visit"],
    included: ["Buffet lunch", "Kayaking gear"],
    excluded: ["National park fee"],
    pricingTiers: [{ tierName: "Adult", price: 150 }],
  },
  createdAt: "2026-01-10T10:00:00.000Z",
  updatedAt: "2026-01-12T15:00:00.000Z",
};

const MOCK_DETAIL_DATA: AdminServiceDetail = {
  ...MOCK_EXISTING_TOUR,
  pricing: [
    {
      id: "price-1",
      serviceId: "tour-999",
      currency: "USD",
      basePrice: 150,
      discountedPrice: 120,
      taxRate: 7,
      validFrom: null,
      validTo: null,
    },
  ],
  availability: [
    {
      id: "avail-1",
      serviceId: "tour-999",
      date: "2026-04-01T00:00:00.000Z",
      isAvailable: true,
      capacity: 30,
      bookedCount: 5,
      externalReferenceId: null,
      lastVerifiedAt: null,
    },
  ],
  media: [
    {
      id: "med-1",
      assetId: "asset-1",
      publicId: "phuket/tours/james-bond-1",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/v1/james-bond.jpg",
      format: "jpg",
      bytes: 1048576,
      folder: "phuket/tours",
      createdAt: "2026-01-10T10:00:00.000Z",
    },
  ],
};

describe("TourEditorModal component", () => {
  const mockCreate = vi.fn();
  const mockUpdate = vi.fn();
  const mockUpdateStatus = vi.fn();
  const mockUpdatePricing = vi.fn();
  const mockUpdateAvailability = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockCreate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { ...MOCK_EXISTING_TOUR, id: "tour-created-123" },
      }),
    });

    mockUpdate.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { ...MOCK_EXISTING_TOUR },
      }),
    });

    mockUpdateStatus.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({
        success: true,
        data: { ...MOCK_EXISTING_TOUR, status: "PUBLISHED" },
      }),
    });

    mockUpdatePricing.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true, data: {} }),
    });

    mockUpdateAvailability.mockReturnValue({
      unwrap: vi.fn().mockResolvedValue({ success: true, data: {} }),
    });

    vi.mocked(adminApiModule.useCreateAdminServiceMutation).mockReturnValue([
      mockCreate,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useCreateAdminServiceMutation>[1],
    ]);

    vi.mocked(adminApiModule.useUpdateAdminServiceMutation).mockReturnValue([
      mockUpdate,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useUpdateAdminServiceMutation>[1],
    ]);

    vi.mocked(adminApiModule.useUpdateAdminServiceStatusMutation).mockReturnValue([
      mockUpdateStatus,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useUpdateAdminServiceStatusMutation>[1],
    ]);

    vi.mocked(adminApiModule.useUpdateAdminServicePricingMutation).mockReturnValue([
      mockUpdatePricing,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useUpdateAdminServicePricingMutation>[1],
    ]);

    vi.mocked(adminApiModule.useUpdateAdminServiceAvailabilityMutation).mockReturnValue([
      mockUpdateAvailability,
      { isLoading: false } as unknown as ReturnType<typeof adminApiModule.useUpdateAdminServiceAvailabilityMutation>[1],
    ]);

    vi.mocked(adminApiModule.useGetAdminServiceByIdQuery).mockReturnValue({
      data: { success: true, data: MOCK_DETAIL_DATA },
      isLoading: false,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminServiceByIdQuery>);
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TourEditorModal isOpen={false} onClose={mockOnClose} mode="create" />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders Create Tour Modal with all navigation tabs", () => {
    render(
      <TourEditorModal isOpen={true} onClose={mockOnClose} mode="create" />
    );

    expect(screen.getByText("Create New Tour Package")).toBeInTheDocument();
    expect(screen.getByTestId("tour-editor-tab-basic")).toBeInTheDocument();
    expect(screen.getByTestId("tour-editor-tab-pricing")).toBeInTheDocument();
    expect(screen.getByTestId("tour-editor-tab-itinerary")).toBeInTheDocument();
    expect(screen.getByTestId("tour-editor-tab-availability")).toBeInTheDocument();
    expect(screen.getByTestId("tour-editor-tab-media")).toBeInTheDocument();
  });

  it("switches tabs when tab buttons are clicked", () => {
    render(
      <TourEditorModal isOpen={true} onClose={mockOnClose} mode="create" />
    );

    // Switch to Pricing Tab
    fireEvent.click(screen.getByTestId("tour-editor-tab-pricing"));
    expect(screen.getByText("1. Tour Base Pricing")).toBeInTheDocument();
    expect(screen.getByText("2. Package Options & Passenger Pricing")).toBeInTheDocument();

    // Switch to Itinerary Tab
    fireEvent.click(screen.getByTestId("tour-editor-tab-itinerary"));
    expect(screen.getByText("Tour Itinerary Schedule")).toBeInTheDocument();

    // Switch to Availability Tab
    fireEvent.click(screen.getByTestId("tour-editor-tab-availability"));
    expect(screen.getByText("1. General Departure Schedule")).toBeInTheDocument();

    // Switch to Media Tab
    fireEvent.click(screen.getByTestId("tour-editor-tab-media"));
    expect(screen.getByText("1. Cover Photo")).toBeInTheDocument();
    expect(screen.getByText(/2\. Tour Photos/i)).toBeInTheDocument();
  });

  it("validates required fields before allowing submission", async () => {
    render(
      <TourEditorModal isOpen={true} onClose={mockOnClose} mode="create" />
    );

    // Click Save as Draft without title
    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    // Expect validation message for tour name
    await waitFor(() => {
      expect(
        screen.getByText("Tour name must be at least 3 characters.")
      ).toBeInTheDocument();
    });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("submits a new tour as Draft with full metadata", async () => {
    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="create"
        onSuccess={mockOnSuccess}
      />
    );

    // Fill Tour Title (auto generates slug)
    const titleInput = screen.getByTestId("tour-form-name-input");
    fireEvent.change(titleInput, { target: { value: "Phi Phi Early Bird Island Tour" } });

    // Save as Draft
    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    const createPayload = mockCreate.mock.calls[0][0];
    expect(createPayload.name).toBe("Phi Phi Early Bird Island Tour");
    expect(createPayload.type).toBe("TOUR");
    expect(createPayload.metadata.slug).toBe("phi-phi-early-bird-island-tour");

    // Expect pricing and availability to also be persisted
    await waitFor(() => {
      expect(mockUpdatePricing).toHaveBeenCalledTimes(1);
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("loads existing tour data and supports editing and publishing", async () => {
    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="edit"
        tour={MOCK_EXISTING_TOUR}
        onSuccess={mockOnSuccess}
      />
    );

    expect(
      screen.getByText(`Edit Tour: ${MOCK_EXISTING_TOUR.name}`)
    ).toBeInTheDocument();

    const titleInput = screen.getByTestId("tour-form-name-input");
    expect((titleInput as HTMLInputElement).value).toBe(MOCK_EXISTING_TOUR.name);

    // Modify title
    fireEvent.change(titleInput, {
      target: { value: "James Bond Island VIP Catamaran Cruise" },
    });

    // Click Save & Publish
    const publishBtn = screen.getByTestId("publish-tour-btn");
    fireEvent.click(publishBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: "tour-999",
          name: "James Bond Island VIP Catamaran Cruise",
        })
      );
      expect(mockUpdateStatus).toHaveBeenCalledWith({
        serviceId: "tour-999",
        status: "PUBLISHED",
      });
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it("handles partial failure gracefully and prevents duplicate service creation on retry", async () => {
    // Simulate: createService succeeds, but updatePricing fails initially
    mockUpdatePricing.mockReturnValueOnce({
      unwrap: vi.fn().mockRejectedValue({
        data: { message: "Invalid tax rate constraint." },
      }),
    });

    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="create"
        onSuccess={mockOnSuccess}
      />
    );

    const titleInput = screen.getByTestId("tour-form-name-input");
    fireEvent.change(titleInput, { target: { value: "Coral Island Sunset Cruise" } });

    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    // Initial createService should be called
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockUpdatePricing).toHaveBeenCalledTimes(1);
    });

    // Contextual error banner should be displayed
    await waitFor(() => {
      expect(
        screen.getByText(/Tour basic info was saved, but saving pricing failed/i)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Core tour record exists/i)
      ).toBeInTheDocument();
    });

    // Form should NOT close on partial failure
    expect(mockOnClose).not.toHaveBeenCalled();

    // Now user clicks Save as Draft again (retry)
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      // mockCreate should NOT be called again (preventing duplicate tour records!)
      expect(mockCreate).toHaveBeenCalledTimes(1);
      // Instead, mockUpdate should be called for the existing created ID
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: "tour-created-123",
          name: "Coral Island Sunset Cruise",
        })
      );
    });
  });

  it("preserves unrelated metadata when updating an existing tour", async () => {
    const tourWithExtraMetadata: AdminServiceDetail = {
      ...MOCK_DETAIL_DATA,
      metadata: {
        ...MOCK_DETAIL_DATA.metadata,
        customVendorReference: "VENDOR-SECRET-99",
        erpSyncTimestamp: 1720000000,
      },
    };

    vi.mocked(adminApiModule.useGetAdminServiceByIdQuery).mockReturnValue({
      data: { success: true, data: tourWithExtraMetadata },
      isLoading: false,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminServiceByIdQuery>);

    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="edit"
        tour={tourWithExtraMetadata}
        onSuccess={mockOnSuccess}
      />
    );

    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceId: "tour-999",
          metadata: expect.objectContaining({
            customVendorReference: "VENDOR-SECRET-99",
            erpSyncTimestamp: 1720000000,
          }),
        })
      );
    });
  });

  it("syncs removed availability dates as blocked/unavailable in database", async () => {
    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="edit"
        tour={MOCK_DETAIL_DATA}
        onSuccess={mockOnSuccess}
      />
    );

    // Switch to Availability Tab
    fireEvent.click(screen.getByTestId("tour-editor-tab-availability"));

    // Find and remove the existing date (2026-04-01)
    const removeBtn = screen.getByLabelText("Remove date 2026-04-01");
    fireEvent.click(removeBtn);

    // Click Save as Draft
    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(mockUpdateAvailability).toHaveBeenCalledWith({
        serviceId: "tour-999",
        date: "2026-04-01",
        isAvailable: false,
        capacity: 0,
      });
    });
  });

  it("persists predefined destination and category in metadata with auto-generated slug", async () => {
    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="create"
        onSuccess={mockOnSuccess}
      />
    );

    // Fill Tour Name
    const titleInput = screen.getByTestId("tour-form-name-input");
    fireEvent.change(titleInput, { target: { value: "Koh Lanta Sunset Expedition" } });

    // Verify URL Slug field is not visible in the normal UI
    expect(screen.queryByLabelText(/URL Slug/i)).not.toBeInTheDocument();

    // Verify no + Add custom option button exists
    expect(screen.queryByTestId("tour-form-destination-create-option-btn")).not.toBeInTheDocument();
    expect(screen.queryByTestId("tour-form-type-create-option-btn")).not.toBeInTheDocument();

    // Save as Draft
    const saveDraftBtn = screen.getByTestId("save-tour-draft-btn");
    fireEvent.click(saveDraftBtn);

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Koh Lanta Sunset Expedition",
          type: "TOUR",
          metadata: expect.objectContaining({
            slug: "koh-lanta-sunset-expedition",
            destination: "Phi Phi Islands",
            destinationCategory: "phi-phi-islands",
            tourType: "island-tours",
            durationCategory: "full-day",
          }),
        })
      );
    });
  });

  it("restores and preserves saved destination and category when editing an existing tour even if not in presets", () => {
    const tourWithCustoms: AdminServiceDetail = {
      ...MOCK_DETAIL_DATA,
      metadata: {
        ...MOCK_DETAIL_DATA.metadata,
        destination: "Similan Deep Sea",
        destinationCategory: "similan-deep-sea",
        tourType: "Night Diving & Bioluminescence",
        durationCategory: "full-day",
      },
    };

    vi.mocked(adminApiModule.useGetAdminServiceByIdQuery).mockReturnValue({
      data: { success: true, data: tourWithCustoms },
      isLoading: false,
    } as unknown as ReturnType<typeof adminApiModule.useGetAdminServiceByIdQuery>);

    render(
      <TourEditorModal
        isOpen={true}
        onClose={mockOnClose}
        mode="edit"
        tour={tourWithCustoms}
        onSuccess={mockOnSuccess}
      />
    );

    // Destination should display the saved value even if not in default presets
    expect(screen.getByTestId("tour-form-destination-select")).toHaveTextContent(
      "Similan Deep Sea"
    );

    // Category should display the saved value even if not in default presets
    expect(screen.getByTestId("tour-form-type-select")).toHaveTextContent(
      "Night Diving & Bioluminescence"
    );
  });
});
