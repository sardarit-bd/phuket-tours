import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ToursTable } from "./tours-table";
import type { AdminServiceRecord } from "../../types/admin";

const MOCK_TOURS: AdminServiceRecord[] = [
  {
    id: "tour-1",
    name: "Phi Phi Islands Sunrise Speedboat",
    description: "Early morning speed boat to avoid crowds",
    type: "TOUR",
    status: "PUBLISHED",
    providerName: "Andaman Adventures",
    providerId: "prov-1",
    metadata: {
      destination: "Phi Phi Islands",
      location: { city: "Phuket" },
    },
    createdAt: "2026-01-01T08:00:00.000Z",
    updatedAt: "2026-01-10T12:00:00.000Z",
    pricingSummary: {
      currency: "THB",
      basePrice: 3200,
      discountedPrice: 2800,
      taxRate: 7,
      validFrom: null,
      validTo: null,
    },
    availabilitySummary: {
      availableDateCount: 20,
      unavailableDateCount: 3,
      totalCapacity: 30,
      bookedCount: 15,
    },
  },
  {
    id: "tour-2",
    name: "Phang Nga Bay Sea Canoe Expedition",
    description: null,
    type: "TOUR",
    status: "DRAFT",
    providerName: null,
    providerId: null,
    metadata: null,
    createdAt: "2026-01-05T08:00:00.000Z",
    updatedAt: "2026-01-12T14:30:00.000Z",
    pricingSummary: null, // missing pricing
    availabilitySummary: null, // missing availability
  },
];

describe("ToursTable component", () => {
  it("renders table with tours list, metadata, pricing, and availability", () => {
    render(
      <ToursTable
        tours={MOCK_TOURS}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onToggleSelectAll={vi.fn()}
        onViewDetails={vi.fn()}
        onEditTour={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    // Tour 1 checks
    expect(screen.getByText("Phi Phi Islands Sunrise Speedboat")).toBeInTheDocument();
    expect(screen.getByText("Early morning speed boat to avoid crowds")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands")).toBeInTheDocument();
    expect(screen.getByText("Andaman Adventures")).toBeInTheDocument();
    expect(screen.getByText("THB 3,200")).toBeInTheDocument();
    expect(screen.getByText("Sale: THB 2,800")).toBeInTheDocument();
    expect(screen.getByText("20 dates open")).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();

    // Tour 2 checks (fallback states for missing metadata, provider, pricing, availability)
    expect(screen.getByText("Phang Nga Bay Sea Canoe Expedition")).toBeInTheDocument();
    expect(screen.getByText("No description")).toBeInTheDocument();
    expect(screen.getByText("Not set")).toBeInTheDocument();
    expect(screen.getByText("Unassigned")).toBeInTheDocument();
    expect(screen.getAllByText("Not configured")).toHaveLength(2); // 1 for pricing, 1 for availability
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("handles row checkbox selection and select all", () => {
    const handleToggleSelect = vi.fn();
    const handleToggleSelectAll = vi.fn();

    render(
      <ToursTable
        tours={MOCK_TOURS}
        selectedIds={["tour-1"]}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onViewDetails={vi.fn()}
        onEditTour={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    const rowCheckbox1 = screen.getByTestId("select-tour-checkbox-tour-1");
    expect(rowCheckbox1).toBeChecked();

    const rowCheckbox2 = screen.getByTestId("select-tour-checkbox-tour-2");
    expect(rowCheckbox2).not.toBeChecked();

    // Click checkbox
    fireEvent.click(rowCheckbox2);
    expect(handleToggleSelect).toHaveBeenCalledWith("tour-2");

    // Click select all
    const selectAllCheckbox = screen.getByTestId("select-all-tours-checkbox");
    fireEvent.click(selectAllCheckbox);
    expect(handleToggleSelectAll).toHaveBeenCalledTimes(1);
  });

  it("handles view details trigger", () => {
    const handleViewDetails = vi.fn();

    render(
      <ToursTable
        tours={MOCK_TOURS}
        selectedIds={[]}
        onToggleSelect={vi.fn()}
        onToggleSelectAll={vi.fn()}
        onViewDetails={handleViewDetails}
        onEditTour={vi.fn()}
        onStatusChange={vi.fn()}
      />
    );

    const tourTitleBtn = screen.getByText("Phi Phi Islands Sunrise Speedboat");
    fireEvent.click(tourTitleBtn);
    expect(handleViewDetails).toHaveBeenCalledWith(MOCK_TOURS[0]);
  });
});
