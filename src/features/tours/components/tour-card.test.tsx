import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TourCard } from "./tour-card";
import { mockTours } from "../data/tours-data";

describe("TourCard component", () => {
  const sampleTour = mockTours[0]; // Phi Phi Islands Day Trip ($89, Popular, 4.8, 1245 reviews)

  it("renders tour title, duration, destination, rating, review count, and price", () => {
    render(<TourCard tour={sampleTour} />);

    expect(screen.getByText("Phi Phi Islands Day Trip")).toBeInTheDocument();
    expect(screen.getByText("Full Day")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(1,245 reviews)")).toBeInTheDocument();
    expect(screen.getByText("$89")).toBeInTheDocument();
    expect(screen.getByText(/from/i)).toBeInTheDocument();
  });

  it("renders the badge if present", () => {
    render(<TourCard tour={sampleTour} />);
    expect(screen.getByText("Popular")).toBeInTheDocument();
  });

  it("renders the View Tour CTA with correct link", () => {
    render(<TourCard tour={sampleTour} />);
    const link = screen.getByRole("link", {
      name: /view tour details for phi phi islands day trip/i,
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tours?slug=phi-phi-islands-day-trip");
  });

  it("calls onToggleFavorite when the favorite heart button is clicked", () => {
    const handleToggle = vi.fn();
    render(
      <TourCard
        tour={sampleTour}
        isFavorite={false}
        onToggleFavorite={handleToggle}
      />
    );

    const favoriteButton = screen.getByRole("button", {
      name: /add phi phi islands day trip to favorites/i,
    });
    fireEvent.click(favoriteButton);

    expect(handleToggle).toHaveBeenCalledWith(sampleTour.id);
  });
});
