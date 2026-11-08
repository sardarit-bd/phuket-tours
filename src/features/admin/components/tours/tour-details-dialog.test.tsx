import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourDetailsDialog } from "./tour-details-dialog";
import type { AdminServiceRecord } from "../../types/admin";

vi.mock("../../api/admin-api", () => {
  return {
    useGetAdminServiceByIdQuery: vi.fn(() => ({
      data: null,
      isLoading: false,
    })),
  };
});

const MOCK_TOUR_DETAIL: AdminServiceRecord = {
  id: "tour-similan-01",
  name: "Similan Islands Full Day Speedboat Adventure",
  description: "Experience pristine turquoise bays, granite boulder landscapes, and coral reefs.",
  type: "TOUR",
  status: "PUBLISHED",
  providerName: "Similan Marine Adventures",
  providerId: "prov-similan",
  metadata: {
    slug: "similan-islands-speedboat-adventure",
    subtitle: "Snorkeling Paradise in the Andaman Sea",
    destination: "Similan Islands",
    duration: "Full Day (8 Hours)",
    tourType: "Island Tours & Island Hopping",
    groupSize: "Max 30 guests",
    languages: ["English", "Thai", "German"],
    featuredImage: "https://res.cloudinary.com/demo/image/upload/v1/similan-hero.jpg",
    images: [
      "https://res.cloudinary.com/demo/image/upload/v1/similan-hero.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1/similan-beach.jpg",
    ],
    highlights: [
      "Visit Donald Duck Bay and the Sailing Rock viewpoint",
      "Snorkel among sea turtles in crystal clear waters",
    ],
    included: [
      "Speedboat transfers with experienced captain",
      "Delicious Thai buffet lunch & fresh tropical fruit",
      "National park entrance fees included",
    ],
    excluded: ["Personal alcoholic beverages", "Staff gratuities"],
    pricingTiers: [
      { tierName: "Adult", price: 3500 },
      { tierName: "Child (4-11)", price: 2500, description: "Includes child life vest" },
    ],
    itinerary: [
      {
        day: 1,
        time: "06:30 - 07:30",
        title: "Hotel Pickup & Pier Check-in",
        description: "Van pickup from Phuket resorts and transfer to private pier for light breakfast.",
      },
      {
        day: 1,
        time: "08:30 - 10:00",
        title: "Speedboat Departure to Koh Similan",
        description: "Scenic ride across the open Andaman sea to Island No. 8.",
      },
    ],
    scheduleDetails: {
      isDaily: true,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      timeSlots: ["08:00 AM", "09:30 AM"],
      operatingHours: "08:00 AM - 05:30 PM",
    },
  },
  createdAt: "2026-01-05T08:00:00.000Z",
  updatedAt: "2026-01-20T14:30:00.000Z",
  pricingSummary: {
    currency: "THB",
    basePrice: 3500,
    discountedPrice: 3150,
    taxRate: 7,
    validFrom: null,
    validTo: null,
  },
  availabilitySummary: {
    availableDateCount: 20,
    unavailableDateCount: 2,
    totalCapacity: 30,
    bookedCount: 12,
  },
};

describe("TourDetailsDialog component", () => {
  const mockOnClose = vi.fn();
  const mockOnEdit = vi.fn();

  it("does not render when tour is null or dialog is closed", () => {
    const { container: closedContainer } = render(
      <TourDetailsDialog
        isOpen={false}
        onClose={mockOnClose}
        tour={MOCK_TOUR_DETAIL}
      />
    );
    expect(closedContainer.firstChild).toBeNull();

    const { container: nullTourContainer } = render(
      <TourDetailsDialog
        isOpen={true}
        onClose={mockOnClose}
        tour={null}
      />
    );
    expect(nullTourContainer.firstChild).toBeNull();
  });

  it("renders complete tour metadata and presentation sections", () => {
    render(
      <TourDetailsDialog
        isOpen={true}
        onClose={mockOnClose}
        tour={MOCK_TOUR_DETAIL}
        onEdit={mockOnEdit}
      />
    );

    // Title & Status
    expect(
      screen.getAllByText("Similan Islands Full Day Speedboat Adventure").length
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("Snorkeling Paradise in the Andaman Sea")
    ).toBeInTheDocument();
    expect(screen.getByText("Published")).toBeInTheDocument();

    // Key Attributes
    expect(screen.getByText("Similan Islands")).toBeInTheDocument();
    expect(screen.getByText("Full Day (8 Hours)")).toBeInTheDocument();
    expect(screen.getByText("Max 30 guests")).toBeInTheDocument();
    expect(screen.getByText("Similan Marine Adventures")).toBeInTheDocument();

    // Languages
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("Thai")).toBeInTheDocument();
    expect(screen.getByText("German")).toBeInTheDocument();

    // Highlights & Inclusions
    expect(
      screen.getByText("Visit Donald Duck Bay and the Sailing Rock viewpoint")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Speedboat transfers with experienced captain")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Personal alcoholic beverages")
    ).toBeInTheDocument();

    // Pricing & Variations
    expect(screen.getByText("Pricing & Package Variations")).toBeInTheDocument();
    expect(screen.getByText("Adult")).toBeInTheDocument();
    expect(screen.getByText("Child (4-11)")).toBeInTheDocument();
    expect(screen.getAllByText(/THB 3,500/).length).toBeGreaterThan(0);

    // Itinerary Stops
    expect(
      screen.getByText(/Itinerary Schedule \(2 Stops\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText("Hotel Pickup & Pier Check-in")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Speedboat Departure to Koh Similan")
    ).toBeInTheDocument();

    // Departure Schedule & Capacity
    expect(
      screen.getByText("Availability & Departure Schedule")
    ).toBeInTheDocument();
    expect(screen.getByText("Daily (7 Days/Week)")).toBeInTheDocument();
    expect(screen.getByText("30 travelers")).toBeInTheDocument();
  });

  it("calls onEdit when Edit Tour Package button is clicked", () => {
    render(
      <TourDetailsDialog
        isOpen={true}
        onClose={mockOnClose}
        tour={MOCK_TOUR_DETAIL}
        onEdit={mockOnEdit}
      />
    );

    const editBtn = screen.getByTestId("edit-tour-from-modal-btn");
    fireEvent.click(editBtn);

    expect(mockOnEdit).toHaveBeenCalledWith(MOCK_TOUR_DETAIL);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
