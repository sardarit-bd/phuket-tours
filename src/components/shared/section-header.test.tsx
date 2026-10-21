import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeader } from "./section-header";

describe("SectionHeader component", () => {
  it("renders the required title as a heading", () => {
    render(<SectionHeader title="Popular Day Trips" />);

    const heading = screen.getByRole("heading", { level: 2, name: /popular day trips/i });
    expect(heading).toBeInTheDocument();
  });

  it("renders subtitle text when provided", () => {
    render(
      <SectionHeader
        title="Popular Day Trips"
        subtitle="Explore pristine beaches and limestone karsts."
      />
    );

    expect(
      screen.getByText(/explore pristine beaches and limestone karsts/i)
    ).toBeInTheDocument();
  });

  it("does not render subtitle element when omitted", () => {
    render(<SectionHeader title="Featured Excursions" />);

    expect(screen.queryByText(/explore/i)).not.toBeInTheDocument();
  });

  it("renders badge text when badge prop is provided", () => {
    render(
      <SectionHeader
        badge="Best Seller"
        title="Phi Phi Islands Tour"
      />
    );

    expect(screen.getByText("Best Seller")).toBeInTheDocument();
  });

  it("does not render badge container when badge is omitted", () => {
    const { container } = render(<SectionHeader title="Similan Islands" />);

    // Only heading should exist inside the container
    expect(container.querySelectorAll("span")).toHaveLength(0);
  });
});
