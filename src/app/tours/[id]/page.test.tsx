import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import TourDetailsPage from "./page";
import type { Tour } from "@/features/tours/types/tour";

// ── Fixtures ──────────────────────────────────────────────────────────────
const mockTour: Tour = {
  id: "t1",
  slug: "t1",
  title: "Phi Phi Islands Tour",
  subtitle: "A premium island experience",
  description: "Explore the stunning Phi Phi Islands.",
  categoryId: "island-tours",
  categoryName: "Island Tours",
  images: [
    "https://img/1.jpg",
    "https://img/2.jpg",
    "https://img/3.jpg",
    "https://img/4.jpg",
    "https://img/5.jpg",
    "https://img/6.jpg",
  ],
  featuredImage: "https://img/cover.jpg",
  duration: "Full Day",
  durationCategory: "full-day",
  destination: "Phi Phi Islands",
  destinationCategory: "phi-phi-islands",
  tourType: "island-tours",
  groupSize: "20",
  providerName: "ABC Tours",
  price: {
    amount: 99,
    currency: "USD",
    originalAmount: 120,
    discountPercentage: 18,
    hasPrice: true,
  },
  highlights: ["Snorkeling", "Longtail boat"],
  included: ["Hotel pickup", "Lunch"],
  excluded: ["Travel insurance"],
  itinerary: [
    { day: 1, time: "07:00", title: "Departure", description: "Pickup" },
  ],
  scheduleDetails: { isDaily: true, timeSlots: ["07:00"] },
};

let mockState: { data?: Tour; isLoading: boolean; isError: boolean };
const { useGetTourByIdQuery } = vi.hoisted(() => ({
  useGetTourByIdQuery: vi.fn(),
}));

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetTourByIdQuery,
}));

vi.mock("next/image", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("react");
  return {
    __esModule: true,
    default: (props: any) =>
      mod.createElement("img", {
        src: props.src,
        alt: props.alt,
        "data-testid": "page-img",
      }),
  };
});

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "t1" }),
  usePathname: () => "/tours/t1",
}));

describe("TourDetailsPage", () => {
  const setMock = (override: Partial<typeof mockState>) => {
    mockState = { data: mockTour, isLoading: false, isError: false, ...override };
    useGetTourByIdQuery.mockImplementation(() => ({
      data: mockState.data,
      isLoading: mockState.isLoading,
      isError: mockState.isError,
      refetch: vi.fn(),
    }));
  };

  beforeEach(() => {
    setMock({});
  });

  it("renders the tour header, gallery, booking card, and tabs", () => {
    setMock({});
    render(<TourDetailsPage />);

    // Header
    expect(screen.getByRole("heading", { name: /Phi Phi Islands Tour/i })).toBeInTheDocument();
    expect(screen.getByText("All tours")).toBeInTheDocument();

    // Booking card shows discounted price
    expect(screen.getByText("$99")).toBeInTheDocument();
    expect(screen.getByText(/per person/)).toBeInTheDocument();

    // Tabs present
    expect(screen.getByRole("tab", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "What's Included" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Tour Details" })).toBeInTheDocument();
  });

  it("shows the starting price as a compact 'Contact for pricing' when no price", () => {
    setMock({
      data: {
        ...mockTour,
        price: { amount: 0, currency: "USD", hasPrice: false },
      },
    });
    render(<TourDetailsPage />);
    expect(screen.getByText("Contact for pricing")).toBeInTheDocument();
  });

  it("renders the not-found state when the query errors", () => {
    setMock({ data: undefined, isError: true });
    render(<TourDetailsPage />);
    expect(screen.getByText("Tour not found")).toBeInTheDocument();
  });

  it("shows the loading skeleton while the query is in flight", () => {
    setMock({ data: undefined, isLoading: true });
    const { container } = render(<TourDetailsPage />);
    expect(container.querySelector(".animate-pulse")).toBeInTheDocument();
  });
});
