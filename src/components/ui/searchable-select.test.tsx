import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SearchableSelect } from "./searchable-select";

const TEST_OPTIONS = [
  { value: "tour-1", label: "Phi Phi Island Day Trip" },
  { value: "tour-2", label: "James Bond Island Cruise" },
  { value: "tour-3", label: "Similan Islands Snorkeling" },
];

describe("SearchableSelect", () => {
  it("renders trigger with placeholder and selected option", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        value="tour-1"
        placeholder="Choose a tour"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Phi Phi Island Day Trip");
  });

  it("opens menu when clicked and displays options", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        value="tour-1"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island Cruise")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands Snorkeling")).toBeInTheDocument();
  });

  it("filters options when typing into search input", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        value="tour-1"
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-select-search-input");
    fireEvent.change(searchInput, { target: { value: "James" } });

    expect(screen.getByTestId("test-select-option-tour-2")).toBeInTheDocument();
    expect(screen.queryByTestId("test-select-option-tour-1")).not.toBeInTheDocument();
  });

  it("shows empty state when no options match filter", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        emptyMessage="No tours found"
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-select-search-input");
    fireEvent.change(searchInput, { target: { value: "NonExistent" } });

    expect(screen.getByText("No tours found")).toBeInTheDocument();
  });

  it("calls onChange when an option is selected", () => {
    const handleChange = vi.fn();
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        value="tour-1"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("James Bond Island Cruise"));

    expect(handleChange).toHaveBeenCalledWith("tour-2");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("displays loading state and disables trigger when isLoading is true", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={[]}
        isLoading={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Loading...");
    expect(trigger).toBeDisabled();
  });

  it("displays error state when errorMessage is provided", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={[]}
        errorMessage="Failed to load tours"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Failed to load tours");
  });

  it("supports keyboard navigation: escape closes menu", () => {
    render(
      <SearchableSelect
        id="test-select"
        options={TEST_OPTIONS}
        value="tour-1"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const searchInput = screen.getByTestId("test-select-search-input");
    fireEvent.keyDown(searchInput, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
