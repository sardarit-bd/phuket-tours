import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourDetailsTabs, type TabId } from "./tour-details-tabs";
import { OverviewSection } from "./tour-overview-section";
import { IncludedExcludedSection } from "./tour-included-excluded-section";
import { TourDetailsTabsContent } from "./tour-details-content";
import { Tour } from "../types/tour";

function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "t1",
    slug: "t1",
    title: "Test Tour",
    subtitle: "A great tour",
    description: "Full description here.",
    categoryId: "c",
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

describe("TourDetailsTabs", () => {
  it("renders all three tabs and highlights the active one", () => {
    render(<TourDetailsTabs activeTab="overview" onTabChange={() => {}} />);
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "What's Included" })).toHaveAttribute(
      "aria-selected",
      "false"
    );
    expect(screen.getByRole("tab", { name: "Tour Details" })).toBeInTheDocument();
  });

  it("calls onTabChange with the correct tab id", () => {
    const onTabChange = vi.fn();
    const { unmount } = render(
      <TourDetailsTabs activeTab="overview" onTabChange={onTabChange} />
    );
    fireEvent.click(screen.getByRole("tab", { name: "Tour Details" }));
    expect(onTabChange).toHaveBeenCalledWith("details");
    unmount();
  });
});

describe("OverviewSection", () => {
  it("renders description, facts, and highlights", () => {
    const tour = makeTour({
      groupSize: "20",
      languages: ["English", "Thai"],
      providerName: "ABC Tours",
      location: { city: "Phuket", country: "Thailand", departurePoint: "Old Town" },
      highlights: ["Snorkeling", "Island hopping"],
    });
    render(<OverviewSection tour={tour} />);
    expect(screen.getByText("Full description here.")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("Old Town")).toBeInTheDocument();
    expect(screen.getByText("Snorkeling")).toBeInTheDocument();
  });

  it("hides empty sections (no facts / highlights / description)", () => {
    const tour = makeTour({ description: "" });
    render(<OverviewSection tour={tour} />);
    // No highlights section when empty
    expect(screen.queryByText("Tour highlights")).toBeNull();
  });
});

describe("IncludedExcludedSection", () => {
  it("renders included and excluded lists", () => {
    const tour = makeTour({
      included: ["Hotel pickup", "Lunch"],
      excluded: ["Travel insurance"],
    });
    render(<IncludedExcludedSection tour={tour} />);
    expect(screen.getByText("What's included")).toBeInTheDocument();
    expect(screen.getByText("Hotel pickup")).toBeInTheDocument();
    expect(screen.getByText("What's not included")).toBeInTheDocument();
    expect(screen.getByText("Travel insurance")).toBeInTheDocument();
  });

  it("shows a placeholder when no data exists", () => {
    const tour = makeTour({});
    render(<IncludedExcludedSection tour={tour} />);
    expect(screen.getByText(/will be shown here/i)).toBeInTheDocument();
  });
});

describe("TourDetailsTabsContent", () => {
  it("renders the itinerary timeline grouped by day", () => {
    const tour = makeTour({
      itinerary: [
        { day: 1, time: "07:00", title: "Departure", description: "Pickup" },
        { day: 1, time: "09:00", title: "Snorkeling", description: "Stop 1" },
        { day: 2, time: "10:00", title: "Lunch", description: "Food" },
      ],
    });
    render(<TourDetailsTabsContent tour={tour} />);
    expect(screen.getByText("Day 1")).toBeInTheDocument();
    expect(screen.getByText("Day 2")).toBeInTheDocument();
    expect(screen.getByText("07:00")).toBeInTheDocument();
    expect(screen.getByText("Departure")).toBeInTheDocument();
  });

  it("renders the availability schedule rows", () => {
    const tour = makeTour({
      groupSize: "30",
      scheduleDetails: {
        isDaily: true,
        operatingHours: "07:00 - 16:00",
        timeSlots: ["07:00", "09:00"],
      },
    });
    render(<TourDetailsTabsContent tour={tour} />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.getByText("07:00 - 16:00")).toBeInTheDocument();
    expect(screen.getByText("Up to 30 guests")).toBeInTheDocument();
  });

  it("shows a placeholder when no itinerary or schedule exists", () => {
    const tour = makeTour({});
    render(<TourDetailsTabsContent tour={tour} />);
    expect(screen.getByText(/will be shown here/i)).toBeInTheDocument();
  });
});
