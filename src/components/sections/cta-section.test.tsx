import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CtaSection } from "./cta-section";

describe("CtaSection component", () => {
  it("renders the eyebrow text", () => {
    render(<CtaSection />);
    expect(
      screen.getByText(/your phuket experience starts here/i)
    ).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<CtaSection />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(/ready to explore phuket\?/i);
  });

  it("renders the description", () => {
    render(<CtaSection />);
    expect(
      screen.getByText(/find your next island adventure or phuket experience\./i)
    ).toBeInTheDocument();
  });

  it("renders the pill CTA button with arrow icon linking to /tours", () => {
    render(<CtaSection />);
    const link = screen.getByRole("link", { name: /browse all tours/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/tours");
  });

  it("renders the background image with appropriate attributes", () => {
    render(<CtaSection />);
    const img = screen.getByRole("img", {
      name: /tropical turquoise waters and beach in phuket/i,
    });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", expect.stringContaining("phuket-cta-beach.png"));
  });
});
