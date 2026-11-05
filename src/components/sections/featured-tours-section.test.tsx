import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturedToursSection } from "./featured-tours-section";

describe("FeaturedToursSection component", () => {
  it("renders the eyebrow, heading, and description", () => {
    render(<FeaturedToursSection />);

    expect(screen.getByText(/featured tours/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /explore our phuket tours/i, level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/find your next phuket experience\. browse available tours/i)
    ).toBeInTheDocument();
  });

  it("renders the See All Tours CTA linking to /tours", () => {
    render(<FeaturedToursSection />);

    const cta = screen.getByRole("link", { name: /see all tours/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/tours");
  });

  it("renders all three featured tour cards with categories, titles, and metadata", () => {
    render(<FeaturedToursSection />);

    // Categories
    expect(screen.getByText("ISLAND TOUR")).toBeInTheDocument();
    expect(screen.getByText("ISLAND TOUR · SNORKELLING")).toBeInTheDocument();
    expect(screen.getByText("ISLAND TOUR · MULTI-DAY")).toBeInTheDocument();

    // Titles
    expect(
      screen.getByRole("heading", { name: "Khai Islands Tour Premium", level: 3 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Similan Islands One Day Tour Snorkelling Package",
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Similan Islands 2 Days 1 Night Tent Snorkelling Package",
        level: 3,
      })
    ).toBeInTheDocument();

    // Duration & price rows
    const durationPriceLabels = screen.getAllByText(/duration & price/i);
    expect(durationPriceLabels).toHaveLength(3);

    const availableOptions = screen.getAllByText(/see available options/i);
    expect(availableOptions).toHaveLength(3);
  });

  it("renders View Tour links for all three cards", () => {
    render(<FeaturedToursSection />);

    const viewTourLinks = screen.getAllByRole("link", { name: /view tour/i });
    expect(viewTourLinks).toHaveLength(3);
    viewTourLinks.forEach((link) => {
      expect(link.getAttribute("href")).toContain("/tours");
    });
  });

  it("applies the reference shadow box-shadow: 0px 16px 45px 0px rgba(20, 52, 55, 0.08) to all tour cards", () => {
    const { container } = render(<FeaturedToursSection />);
    const cards = container.querySelectorAll("article");
    expect(cards).toHaveLength(3);
    cards.forEach((card) => {
      expect(card).toHaveClass("shadow-[0px_16px_45px_0px_rgba(20,52,55,0.08)]");
    });
  });
});
