import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroSection } from "./hero-section";

describe("HeroSection component", () => {
  it("renders the hero background image with correct path and alt", () => {
    render(<HeroSection />);
    const bgImg = screen.getByRole("img", {
      name: /tropical beach in phuket/i,
    });
    expect(bgImg).toBeInTheDocument();
    expect(bgImg).toHaveAttribute("src", expect.stringContaining("hero-img.jpg"));
  });

  it("renders the tours & experiences badge", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/tours & experiences in phuket/i)
    ).toBeInTheDocument();
  });

  it("renders the two-line main headline", () => {
    render(<HeroSection />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/discover phuket\.\s*experience more\./i);
  });

  it("renders the supporting description text", () => {
    render(<HeroSection />);
    expect(
      screen.getByText(/explore island adventures, jet ski experiences/i)
    ).toBeInTheDocument();
  });

  it("renders the Browse All Tours CTA button linking to /tours", () => {
    render(<HeroSection />);
    const ctaButton = screen.getByRole("link", { name: /browse all tours/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", "/tours");
  });
});
