import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./header";

describe("Header / Navbar component", () => {
  it("renders the official PhuketTours logo with correct attributes", () => {
    render(<Header />);
    const logoImg = screen.getByRole("img", { name: /phukettours/i });
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", expect.stringContaining("Logo.png"));
  });

  it("renders the main navigation links", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: /^home$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^tours$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^about$/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^contact$/i })).toBeInTheDocument();
  });

  it("renders the Book Now CTA button linking to /tours", () => {
    render(<Header />);
    const bookNowLink = screen.getByRole("link", { name: /book now/i });
    expect(bookNowLink).toBeInTheDocument();
    expect(bookNowLink).toHaveAttribute("href", "/tours");
  });

  it("opens the Tours dropdown menu on hover and closes on Escape", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle tours dropdown menu/i,
    });
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");

    // Hover to reveal dropdown
    await user.hover(toggleButton);
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");

    const allToursLink = screen.getByRole("menuitem", {
      name: /all tours & excursions/i,
    });
    expect(allToursLink).toBeInTheDocument();
    expect(allToursLink).toHaveAttribute("href", "/tours");

    // Pressing Escape should close dropdown
    await user.keyboard("{Escape}");
    expect(toggleButton).toHaveAttribute("aria-expanded", "false");
  });

  it("opens the Tours dropdown on keyboard Enter", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toggleButton = screen.getByRole("button", {
      name: /toggle tours dropdown menu/i,
    });

    toggleButton.focus();
    await user.keyboard("{Enter}");
    expect(toggleButton).toHaveAttribute("aria-expanded", "true");
  });

  it("renders and toggles mobile menu", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const mobileMenuButton = screen.getByRole("button", {
      name: /toggle navigation menu/i,
    });
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");

    await user.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "true");

    await user.click(mobileMenuButton);
    expect(mobileMenuButton).toHaveAttribute("aria-expanded", "false");
  });
});
