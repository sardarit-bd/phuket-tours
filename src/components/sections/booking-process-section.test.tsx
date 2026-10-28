import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookingProcessSection } from "./booking-process-section";

describe("BookingProcessSection component", () => {
  it("renders the eyebrow and main heading", () => {
    render(<BookingProcessSection />);

    expect(screen.getByText(/simple & clear/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /book your phuket experience/i,
        level: 2,
      })
    ).toBeInTheDocument();
  });

  it("renders all four steps in exact order with numbers and labels", () => {
    render(<BookingProcessSection />);

    const stepLabels = [
      "Choose your tour",
      "Select your available options",
      "Review your booking details and price",
      "Complete your booking",
    ];

    stepLabels.forEach((label) => {
      // Multiple instances may exist across responsive views (desktop, tablet, mobile)
      const elements = screen.getAllByText(label);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    const stepNumbers = ["01", "02", "03", "04"];
    stepNumbers.forEach((num) => {
      const numbers = screen.getAllByText(num);
      expect(numbers.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("has accessible aria-labelledby attribute matching heading id", () => {
    render(<BookingProcessSection />);

    const heading = screen.getByRole("heading", {
      name: /book your phuket experience/i,
      level: 2,
    });
    expect(heading).toHaveAttribute("id", "booking-process-heading");
  });

  it("applies the reference background color #FAFEFF", () => {
    const { container } = render(<BookingProcessSection />);
    const section = container.querySelector("section");
    expect(section).toHaveClass("bg-[#FAFEFF]");
  });
});
