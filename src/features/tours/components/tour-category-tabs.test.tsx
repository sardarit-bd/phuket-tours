import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { TourCategoryTabs } from "./tour-category-tabs";
import { tourCategories } from "../data/tours-data";

describe("TourCategoryTabs component", () => {
  it("renders all category buttons in a single row without wrapping", () => {
    const handleSelect = vi.fn();
    render(
      <TourCategoryTabs
        selectedCategory="all"
        onSelectCategory={handleSelect}
      />
    );

    // Ensure all 7 categories exist in DOM
    tourCategories.forEach((cat) => {
      const button = screen.getByRole("button", { name: new RegExp(cat.name, "i") });
      expect(button).toBeInTheDocument();
      // Ensure each button has non-wrapping and non-shrinking flex classes
      expect(button).toHaveClass("flex-shrink-0");
      expect(button).toHaveClass("shrink-0");
      expect(button).toHaveClass("whitespace-nowrap");
    });

    // Ensure the nav container has flex-nowrap and overflow-x-auto
    const nav = screen.getByRole("navigation", { name: /tour categories/i });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass("overflow-x-auto");
    expect(nav).toHaveClass("flex-nowrap");
  });

  it("marks active category with aria-pressed='true' and active style classes", () => {
    render(
      <TourCategoryTabs
        selectedCategory="snorkeling-diving"
        onSelectCategory={vi.fn()}
      />
    );

    const activeBtn = screen.getByRole("button", { name: /snorkeling & diving/i });
    expect(activeBtn).toHaveAttribute("aria-pressed", "true");
    expect(activeBtn).toHaveClass("bg-[#E6F5F6]");
    expect(activeBtn).toHaveClass("text-primary");

    const inactiveBtn = screen.getByRole("button", { name: /all tours/i });
    expect(inactiveBtn).toHaveAttribute("aria-pressed", "false");
    expect(inactiveBtn).toHaveClass("bg-white");
  });

  it("triggers onSelectCategory when a category button is clicked", () => {
    const handleSelect = vi.fn();
    render(
      <TourCategoryTabs
        selectedCategory="all"
        onSelectCategory={handleSelect}
      />
    );

    const transfersBtn = screen.getByRole("button", { name: /transfers/i });
    fireEvent.click(transfersBtn);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith("transfers");
  });

  it("translates mouse wheel events to horizontal scroll when overflowing", () => {
    render(
      <TourCategoryTabs
        selectedCategory="all"
        onSelectCategory={vi.fn()}
      />
    );

    const nav = screen.getByRole("navigation", { name: /tour categories/i });

    // Mock scroll dimensions
    Object.defineProperty(nav, "scrollWidth", { value: 1000, configurable: true });
    Object.defineProperty(nav, "clientWidth", { value: 600, configurable: true });
    Object.defineProperty(nav, "scrollLeft", { value: 50, writable: true, configurable: true });

    const wheelEvent = new WheelEvent("wheel", {
      deltaY: 100,
      deltaX: 0,
      bubbles: true,
      cancelable: true,
    });

    act(() => {
      nav.dispatchEvent(wheelEvent);
    });

    expect(nav.scrollLeft).toBe(150);
  });

  it("renders scroll buttons when scroll position indicates overflow and calls scrollBy", () => {
    render(
      <TourCategoryTabs
        selectedCategory="all"
        onSelectCategory={vi.fn()}
      />
    );

    const nav = screen.getByRole("navigation", { name: /tour categories/i });
    nav.scrollBy = vi.fn();

    // Mock overflowing with scroll in the middle
    Object.defineProperty(nav, "scrollWidth", { value: 1000, configurable: true });
    Object.defineProperty(nav, "clientWidth", { value: 600, configurable: true });
    Object.defineProperty(nav, "scrollLeft", { value: 200, writable: true, configurable: true });

    act(() => {
      fireEvent.scroll(nav);
    });

    const leftBtn = screen.getByRole("button", { name: /scroll categories left/i });
    const rightBtn = screen.getByRole("button", { name: /scroll categories right/i });

    expect(leftBtn).toBeInTheDocument();
    expect(rightBtn).toBeInTheDocument();

    fireEvent.click(leftBtn);
    expect(nav.scrollBy).toHaveBeenCalledWith({ left: -260, behavior: "smooth" });

    fireEvent.click(rightBtn);
    expect(nav.scrollBy).toHaveBeenCalledWith({ left: 260, behavior: "smooth" });
  });
});
