import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ToursPage from "./page";
import { StoreProvider } from "@/store/provider";
import { Tour, ToursResponse } from "@/features/tours/types/tour";

// Mock the tours API hook
const mockTours: Tour[] = [
  {
    id: "1",
    slug: "james-bond-islands-tour",
    title: "James Bond Islands Tour",
    description: "Explore the famous James Bond Islands",
    categoryId: "island-tours",
    images: ["/images/test1.jpg"],
    featuredImage: "/images/test1.jpg",
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "James Bond Island",
    destinationCategory: "james-bond-island",
    tourType: "island-tours",
    price: { amount: 150, currency: "USD" },
    reviews: { rating: 4.8, reviewCount: 500 },
    badge: "Popular",
    badgeVariant: "popular",
  },
  {
    id: "2",
    slug: "similan-islands-day-trip",
    title: "Similan Islands Day Trip",
    description: "Snorkeling day trip to the Similan Islands",
    categoryId: "snorkeling-diving",
    images: ["/images/test2.jpg"],
    featuredImage: "/images/test2.jpg",
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Similan Islands",
    destinationCategory: "similan-islands",
    tourType: "water-activities",
    price: { amount: 120, currency: "USD" },
    reviews: { rating: 4.9, reviewCount: 300 },
  },
  {
    id: "3",
    slug: "phi-phi-islands-tour",
    title: "Phi Phi Islands Tour",
    description: "Island hopping tour to the Phi Phi Islands",
    categoryId: "island-tours",
    images: ["/images/test3.jpg"],
    featuredImage: "/images/test3.jpg",
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phi Phi Islands",
    destinationCategory: "phi-phi-islands",
    tourType: "island-tours",
    price: { amount: 180, currency: "USD" },
    reviews: { rating: 4.7, reviewCount: 800 },
    badge: "Bestseller",
    badgeVariant: "bestseller",
  },
  {
    id: "4",
    slug: "beach-elephant-bathing-phuket",
    title: "Beach Elephant Bathing Phuket",
    description: "Unique elephant bathing experience",
    categoryId: "adventure",
    images: ["/images/test4.jpg"],
    featuredImage: "/images/test4.jpg",
    duration: "Half Day",
    durationCategory: "half-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    tourType: "adventure",
    price: { amount: 90, currency: "USD" },
    reviews: { rating: 4.5, reviewCount: 200 },
  },
];

const mockResponse: ToursResponse = {
  data: mockTours,
  total: mockTours.length,
  page: 1,
  limit: 12,
  totalPages: 1,
};

const mockUseGetToursQuery = vi.fn((...args: unknown[]) => ({
  data: mockResponse,
  isLoading: false,
  isError: false,
  refetch: vi.fn(),
}));

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetToursQuery: (...args: unknown[]) => mockUseGetToursQuery(...args),
}));

describe("ToursPage", () => {
  beforeEach(() => {
    mockUseGetToursQuery.mockClear();
    mockUseGetToursQuery.mockImplementation(
      () => ({
        data: mockResponse,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      })
    );
  });

  it("renders hero section with title, eyebrow, and breadcrumb", () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(screen.getByText("EXPLORE PHUKET")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tours & Experiences", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /breadcrumb/i })
    ).toBeInTheDocument();
  });

  it("renders search bar, category navigation tabs, and filter sidebar", () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(
      screen.getByPlaceholderText(
        /search tours by name, destination or activity/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText("All Tours")).toBeInTheDocument();
    expect(screen.getAllByText("Filter Tours").length).toBeGreaterThanOrEqual(1);
  });

  it("renders tour cards from backend data", async () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(
      await screen.findByText("James Bond Islands Tour")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Similan Islands Day Trip")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Phi Phi Islands Tour")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Beach Elephant Bathing Phuket")
    ).toBeInTheDocument();
  });

  it("displays destination filter options from backend data", async () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    // Destination options should be derived from the tour data.
    // Destination names appear in both the filter sidebar and the tour cards.
    expect(
      (await screen.findAllByText(/James Bond Island/i)).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Similan Islands/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Phi Phi Islands/i).length
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(/Phuket/i).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("displays price and rating from backend data", async () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    // Price should be displayed from backend pricing (currency + amount)
    expect(
      (await screen.findAllByText(/150/)).length
    ).toBeGreaterThanOrEqual(1);

    // Rating should be displayed from backend reviews
    expect(
      (await screen.findAllByText(/4\.8/)).length
    ).toBeGreaterThanOrEqual(1);
  });

  it("calls useGetToursQuery with filter params", async () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    await screen.findByText("James Bond Islands Tour");

    // The query should have been called with the default params
    expect(mockUseGetToursQuery).toHaveBeenCalled();
    const callArgs = mockUseGetToursQuery.mock.calls[0]?.[0];
    expect(callArgs).toMatchObject({
      page: 1,
      limit: 12,
    });
  });
});
