import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExploreExperienceSection } from "./explore-experience-section";

describe("ExploreExperienceSection component", () => {
  it("renders the eyebrow, heading, and description", () => {
    render(<ExploreExperienceSection />);

    expect(screen.getByText(/explore by experience/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /find your phuket experience/i, level: 2 })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/from island adventures to private boat trips/i)
    ).toBeInTheDocument();
  });

  it("renders the See All Experience CTA linking to /experiences", () => {
    render(<ExploreExperienceSection />);

    const cta = screen.getByRole("link", { name: /see all experience/i });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/experiences");
  });

  it("renders all five experience cards in exact order", () => {
    render(<ExploreExperienceSection />);

    const titles = [
      "Islands Tours",
      "Snorkelling Adventures",
      "Jet Ski Tours",
      "Yacht & Boat Tours",
      "ATV & Land Adventures",
    ];

    titles.forEach((title) => {
      expect(
        screen.getByRole("heading", { name: title, level: 3 })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/explore phuket’s stunning islands, hidden beaches/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/discover vibrant marine life/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/experience thrilling rides across/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enjoy scenic cruises and unforgettable days/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/explore phuket’s scenic landscapes with exciting off-road/i)
    ).toBeInTheDocument();
  });

  it("renders Explore More links for each card", () => {
    render(<ExploreExperienceSection />);

    const exploreMoreLinks = screen.getAllByText(/explore more/i);
    expect(exploreMoreLinks).toHaveLength(5);
  });
});
