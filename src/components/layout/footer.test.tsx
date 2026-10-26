import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer component", () => {
  it("renders the official PhuketTours logo", () => {
    render(<Footer />);
    const logo = screen.getByRole("img", { name: /phukettours/i });
    expect(logo).toBeInTheDocument();
  });

  it("renders the brand description", () => {
    render(<Footer />);
    expect(
      screen.getByText(/we are passionate about showcasing the best of phuket/i)
    ).toBeInTheDocument();
  });

  it("renders the social media links with accessible labels", () => {
    render(<Footer />);
    expect(screen.getByLabelText(/facebook/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instagram/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/x \(formerly twitter\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/whatsapp/i)).toBeInTheDocument();
  });

  it("renders the Quick Links column", () => {
    render(<Footer />);
    expect(screen.getByText("Quick Links")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tour Packages" })).toBeInTheDocument();
  });

  it("renders the Support column", () => {
    render(<Footer />);
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help Center" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "FAQs" })).toBeInTheDocument();
  });

  it("renders the Get in Touch column with location and phone", () => {
    render(<Footer />);
    expect(screen.getByText("Get in Touch")).toBeInTheDocument();
    expect(screen.getByText(/611, 1 patak rd, karon/i)).toBeInTheDocument();
    expect(screen.getByText("+66 64 978 0775")).toBeInTheDocument();
  });

  it("renders the bottom copyright and legal links", () => {
    render(<Footer />);
    expect(
      screen.getByText(/© 2026 phuket tours\. all rights reserved\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cookies" })).toBeInTheDocument();
  });
});
