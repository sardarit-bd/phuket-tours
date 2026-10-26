import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FaqSection } from "./faq-section";

describe("FaqSection component", () => {
  it("renders the eyebrow, heading, and description", () => {
    render(<FaqSection />);

    expect(screen.getByText(/good to know/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: /frequently asked questions/i,
        level: 2,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /helpful information for planning and booking your phuket experience\./i
      )
    ).toBeInTheDocument();
  });

  it("renders all four questions from the reference", () => {
    render(<FaqSection />);

    expect(
      screen.getByRole("button", {
        name: /how do i know which pickup time applies to my tour\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /are child and adult prices the same\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /what is included in my tour\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /can i change or cancel a booking\?/i,
      })
    ).toBeInTheDocument();
  });

  it("has the first FAQ item open by default and others collapsed", () => {
    render(<FaqSection />);

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[2]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[3]).toHaveAttribute("aria-expanded", "false");

    // First answer is visible
    expect(
      screen.getByText(
        /pickup locations and times vary by tour and area\. your tour page and booking details will show the confirmed information for your selected option\./i
      )
    ).toBeInTheDocument();
  });

  it("toggles items open and closed on click", () => {
    render(<FaqSection />);

    const button1 = screen.getByRole("button", {
      name: /how do i know which pickup time applies to my tour\?/i,
    });
    const button2 = screen.getByRole("button", {
      name: /are child and adult prices the same\?/i,
    });

    // Click item 2 to expand it and collapse item 1
    fireEvent.click(button2);
    expect(button2).toHaveAttribute("aria-expanded", "true");
    expect(button1).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByText(/guest pricing options \(adult and child rates\)/i)
    ).toBeInTheDocument();

    // Click item 2 again to collapse it
    fireEvent.click(button2);
    expect(button2).toHaveAttribute("aria-expanded", "false");
  });

  it("links aria-controls to the answer panel id", () => {
    render(<FaqSection />);

    const button1 = screen.getByRole("button", {
      name: /how do i know which pickup time applies to my tour\?/i,
    });
    const controlsId = button1.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();

    const panel = document.getElementById(controlsId!);
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveAttribute("role", "region");
    expect(panel).toHaveAttribute("aria-labelledby", button1.id);
  });
});
