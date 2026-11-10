import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KnowBeforeYouGoSection } from "./know-before-you-go-section";

describe("KnowBeforeYouGoSection component", () => {
  it("renders the eyebrow and main heading", () => {
    render(<KnowBeforeYouGoSection />);

    expect(screen.getByText(/tour details/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /know before you go/i,
        level: 2,
      })
    ).toBeInTheDocument();
  });

  it("has accessible aria-labelledby attribute matching heading id", () => {
    render(<KnowBeforeYouGoSection />);

    const heading = screen.getByRole("heading", {
      name: /know before you go/i,
      level: 2,
    });
    expect(heading).toHaveAttribute("id", "know-before-you-go-heading");
  });

  it("renders all three information rows with labels, titles, and descriptions", () => {
    render(<KnowBeforeYouGoSection />);

    // Labels
    expect(screen.getByText("PICKUP")).toBeInTheDocument();
    expect(screen.getByText("GUEST OPTIONS")).toBeInTheDocument();
    expect(screen.getByText(/what[’']s\s+included/i)).toBeInTheDocument();

    // Titles
    expect(
      screen.getByRole("heading", {
        name: "Tour-specific locations & times",
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Adult, child & package choices",
        level: 3,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Clear booking information",
        level: 3,
      })
    ).toBeInTheDocument();

    // Descriptions
    expect(
      screen.getByText(
        "Confirmed details are shown for your selected tour and pickup area."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Available guest types and variants depend on the individual tour."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Review confirmed inclusions and booking details before checkout."
      )
    ).toBeInTheDocument();
  });

  it("renders the tour image with correct source and accessible alt text", () => {
    render(<KnowBeforeYouGoSection />);

    const image = screen.getByRole("img", {
      name: /phuket tour boat anchored in clear turquoise water/i,
    });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      expect.stringMatching(/know-before-you-go\.(webp|jpg)/)
    );
  });

  it("uses the tour-detail-row CSS grid structure for each row", () => {
    const { container } = render(<KnowBeforeYouGoSection />);
    const rows = container.querySelectorAll(".tour-detail-row");
    expect(rows.length).toBe(3);
  });

  it("renders neutral placeholder when image encounters an error", () => {
    render(<KnowBeforeYouGoSection />);

    const image = screen.getByRole("img", {
      name: /phuket tour boat anchored in clear turquoise water/i,
    });

    // Simulate image error
    fireEvent.error(image);

    expect(
      screen.getByRole("img", { name: /tour details photo placeholder/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/tour details photo/i)).toBeInTheDocument();
    expect(screen.getByText(/528 × 506px/i)).toBeInTheDocument();
  });
});
