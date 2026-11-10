import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { CustomDropdown, DropdownOption } from "./custom-dropdown";

const testOptions: DropdownOption[] = [
  { value: "most-popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "duration", label: "Duration" },
];

describe("CustomDropdown component", () => {
  it("renders closed trigger button with selected option label and combobox role", () => {
    render(
      <CustomDropdown
        id="test-sort"
        options={testOptions}
        value="most-popular"
        onChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("Most Popular");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("opens menu when trigger is clicked and displays all options", () => {
    render(
      <CustomDropdown
        id="test-sort"
        options={testOptions}
        value="most-popular"
        onChange={vi.fn()}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent("Most Popular");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[1]).toHaveTextContent("Price: Low to High");
    expect(options[1]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onChange and closes menu when an option is clicked", () => {
    const handleChange = vi.fn();
    render(
      <CustomDropdown
        id="test-sort"
        options={testOptions}
        value="most-popular"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const option = screen.getByRole("option", { name: /price: low to high/i });
    fireEvent.click(option);

    expect(handleChange).toHaveBeenCalledWith("price-asc");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes menu when clicking outside", () => {
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <CustomDropdown
          id="test-sort"
          options={testOptions}
          value="most-popular"
          onChange={vi.fn()}
        />
      </div>
    );

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    act(() => {
      fireEvent.mouseDown(screen.getByTestId("outside"));
    });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("handles keyboard navigation: ArrowDown, ArrowUp, Enter, and Escape", () => {
    const handleChange = vi.fn();
    render(
      <CustomDropdown
        id="test-sort"
        options={testOptions}
        value="most-popular"
        onChange={handleChange}
      />
    );

    const trigger = screen.getByRole("combobox");

    // Press ArrowDown on closed trigger to open
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    // Navigate to next option (price-asc)
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // Navigate to next option (price-desc)
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // Select with Enter
    fireEvent.keyDown(trigger, { key: "Enter" });

    expect(handleChange).toHaveBeenCalledWith("price-desc");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    // Reopen and test Escape
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
