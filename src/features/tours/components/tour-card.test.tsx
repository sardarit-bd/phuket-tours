import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourCard } from "./tour-card";
import { Tour } from "../types/tour";
import { mockTours } from "../data/tours-data";

describe("TourCard component", () => {
  // Use a curated tour with badge and reviews (Similan Islands Day Trip, ID 802)
  const curatedTour = mockTours.find((t) => t.id === "802") || mockTours[0];
  // Use a placeholder client tour without reviews or badges (Siam Niramit Show Silver, ID 792)
  const placeholderTour = mockTours.find((t) => t.id === "792") || mockTours[0];

  it("renders tour title, duration, destination, rating, review count, and price for curated tours", () => {
    render(<TourCard tour={curatedTour} />);

    expect(screen.getByText(curatedTour.title)).toBeInTheDocument();
    expect(screen.getByText(curatedTour.duration)).toBeInTheDocument();
    expect(screen.getByText(curatedTour.destination)).toBeInTheDocument();
    expect(screen.getByText("4.9")).toBeInTheDocument();
    expect(screen.getByText("(892 reviews)")).toBeInTheDocument();
    expect(screen.getByText("From")).toBeInTheDocument();
    // Price is formatted via formatPrice; for "$" currency (mock data)
    // the fallback renders "$ 120" — verify the amount is present
    expect(screen.getByText(/120/)).toBeInTheDocument();
    expect(screen.getByText(/from/i)).toBeInTheDocument();
  });

  it("renders the badge if present", () => {
    render(<TourCard tour={curatedTour} />);
    expect(screen.getByText("Bestseller")).toBeInTheDocument();
  });

  it("renders the View Tour CTA with correct link", () => {
    render(<TourCard tour={curatedTour} />);
    const link = screen.getByRole("link", {
      name: new RegExp(`view tour details for ${curatedTour.title}`, "i"),
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", `/tours/${curatedTour.id}`);
  });

  it("calls onToggleFavorite when the favorite heart button is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <TourCard
        tour={curatedTour}
        isFavorite={false}
        onToggleFavorite={handleToggle}
      />
    );

    const favoriteButton = screen.getByRole("button", {
      name: new RegExp(`add ${curatedTour.title} to favorites`, "i"),
    });
    fireEvent.click(favoriteButton);

    expect(handleToggle).toHaveBeenCalledWith(curatedTour.id);
  });

  it("does not render unverified review stars for placeholder client tours", () => {
    render(<TourCard tour={placeholderTour} />);

    expect(screen.getByText(placeholderTour.title)).toBeInTheDocument();
    // Reviews are undefined for placeholder tours to avoid presenting invented data
    expect(screen.queryByText(/reviews\)/i)).not.toBeInTheDocument();
  });

  it("displays 'Price unavailable' in a compact style when hasPrice is false", () => {
    const tourNoPrice: Tour = {
      ...curatedTour,
      price: { amount: 0, currency: "USD", hasPrice: false },
    };
    render(<TourCard tour={tourNoPrice} />);

    // "Price unavailable" text is present
    expect(screen.getByText("Price unavailable")).toBeInTheDocument();
    // It should use a smaller font than the regular price display
    const priceEl = screen.getByText("Price unavailable");
    expect(priceEl).toHaveClass("text-sm");
    expect(priceEl).toHaveClass("font-semibold");
    expect(priceEl).toHaveClass("text-[#8A9A9C]");
  });

  it("does not display 'Price unavailable' for valid-priced tours", () => {
    render(<TourCard tour={curatedTour} />);
    // curatedTour has a valid price (120) — "Price unavailable" should not appear
    expect(screen.queryByText("Price unavailable")).not.toBeInTheDocument();
  });

  it("displays 'Free' for zero-amount tours with hasPrice true", () => {
    const freeTour: Tour = {
      ...curatedTour,
      price: { amount: 0, currency: "USD", hasPrice: true },
    };
    render(<TourCard tour={freeTour} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });
});
