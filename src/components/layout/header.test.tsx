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

  it("renders Tours as a normal link pointing to /tours without dropdown toggles", async () => {
    const user = userEvent.setup();
    render(<Header />);

    const toursLink = screen.getByRole("link", { name: /^tours$/i });
    expect(toursLink).toBeInTheDocument();
    expect(toursLink).toHaveAttribute("href", "/tours");

    // Verify there is no dropdown toggle button
    expect(
      screen.queryByRole("button", { name: /toggle tours dropdown menu/i })
    ).not.toBeInTheDocument();

    // Hovering over Tours does not display a dropdown menu or category links
    await user.hover(toursLink);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /all tours & excursions/i })
    ).not.toBeInTheDocument();
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
