import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteTourDialog } from "./delete-tour-dialog";
import * as adminApiModule from "../../api/admin-api";
import type { AdminServiceRecord } from "../../types/admin";

vi.mock("../../api/admin-api", () => ({
  useDeleteAdminServiceMutation: vi.fn(),
}));

const MOCK_TOUR: AdminServiceRecord = {
  id: "tour-test-123",
  name: "Similan Islands Snorkeling Day Trip",
  description: "Crystal clear water tour",
  type: "TOUR",
  status: "PUBLISHED",
  providerName: "Andaman Speedboats",
  providerId: "prov-1",
  metadata: {},
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("DeleteTourDialog component", () => {
  const mockDeleteTour = vi.fn();
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockOnMoveToDraft = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(adminApiModule.useDeleteAdminServiceMutation).mockReturnValue([
      mockDeleteTour,
      { isLoading: false } as any,
    ]);
  });

  it("does not render when tour is null or isOpen is false", () => {
    const { rerender } = render(
      <DeleteTourDialog
        isOpen={false}
        tour={MOCK_TOUR}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByText(/Are you sure you want to delete this tour/i)).not.toBeInTheDocument();

    rerender(
      <DeleteTourDialog
        isOpen={true}
        tour={null}
        onClose={mockOnClose}
      />
    );
    expect(screen.queryByText(/Are you sure you want to delete this tour/i)).not.toBeInTheDocument();
  });

  it("renders tour name and warning in confirmation dialog", () => {
    render(
      <DeleteTourDialog
        isOpen={true}
        tour={MOCK_TOUR}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText("Delete Tour Package")).toBeInTheDocument();
    expect(screen.getByText(/Similan Islands Snorkeling Day Trip/i)).toBeInTheDocument();
    expect(screen.getByTestId("confirm-delete-tour-button")).toBeInTheDocument();
  });

  it("calls delete mutation and triggers onSuccess on confirmed deletion", async () => {
    mockDeleteTour.mockReturnValue({
      unwrap: () => Promise.resolve({ data: { id: MOCK_TOUR.id, name: MOCK_TOUR.name } }),
    });

    render(
      <DeleteTourDialog
        isOpen={true}
        tour={MOCK_TOUR}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    const deleteBtn = screen.getByTestId("confirm-delete-tour-button");
    fireEvent.click(deleteBtn);

    expect(mockDeleteTour).toHaveBeenCalledWith(MOCK_TOUR.id);
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith({ id: MOCK_TOUR.id, name: MOCK_TOUR.name });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("displays backend error message and Move to Draft recommendation when bookings exist", async () => {
    mockDeleteTour.mockReturnValue({
      unwrap: () =>
        Promise.reject({
          data: {
            message:
              'Cannot delete tour "Similan Islands Snorkeling Day Trip" because it has 2 existing bookings. Please move the tour to Draft or Unpublished status instead.',
          },
        }),
    });

    render(
      <DeleteTourDialog
        isOpen={true}
        tour={MOCK_TOUR}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        onMoveToDraft={mockOnMoveToDraft}
      />
    );

    const deleteBtn = screen.getByTestId("confirm-delete-tour-button");
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.getByTestId("delete-tour-error-alert")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Cannot delete tour "Similan Islands Snorkeling Day Trip" because it has 2 existing bookings/i)
    ).toBeInTheDocument();

    const draftBtn = screen.getByTestId("move-to-draft-recommendation-button");
    expect(draftBtn).toBeInTheDocument();
    fireEvent.click(draftBtn);

    expect(mockOnMoveToDraft).toHaveBeenCalledWith(MOCK_TOUR);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
