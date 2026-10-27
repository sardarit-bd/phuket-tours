import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";

describe("AboutPage", () => {
  it("renders the hero section with eyebrow, heading, and breadcrumbs", () => {
    render(<AboutPage />);

    expect(screen.getByText(/ABOUT PHUKETTOURS/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /locally rooted, globally trusted/i,
      })
    ).toBeInTheDocument();

    const breadcrumbNav = screen.getByRole("navigation", {
      name: /breadcrumb/i,
    });
    expect(breadcrumbNav).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /home/i })).toHaveAttribute(
      "href",
      "/"
    );
  });

  it("renders Our Story section with verified statistics and narrative", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /a better way to discover the andaman sea/i,
      })
    ).toBeInTheDocument();

    // Stats
    expect(screen.getByText("440+")).toBeInTheDocument();
    expect(screen.getByText(/Curated Tours/i)).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
    expect(screen.getByText(/Licensed Operators/i)).toBeInTheDocument();
  });

  it("renders Our Mission section with safety, sustainability, and transparency pillars", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /safe, sustainable & honest travel/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /maritime safety & certified crews/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /eco-conscious island tourism/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /honest pricing & clear itineraries/i,
      })
    ).toBeInTheDocument();
  });

  it("renders Why Choose PhuketTours section with benefit cards", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /built for confident travel in phuket/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 3, name: /vetted local operators/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /local phuket expertise/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /weather peace of mind/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /daily traveler support/i })).toBeInTheDocument();
  });

  it("renders Our Experiences section with links to tour categories", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /curated phuket adventures/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByRole("link", { name: /explore islands tours/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explore snorkelling adventures/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view all tours/i })).toHaveAttribute("href", "/tours");
  });

  it("renders Call to Action section linking to /tours", () => {
    render(<AboutPage />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /ready to experience the andaman sea\?/i,
      })
    ).toBeInTheDocument();

    const ctaButton = screen.getByRole("link", { name: /browse all tours/i });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveAttribute("href", "/tours");
  });
});
