import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CreatableSelect } from "./creatable-select";

const TEST_OPTIONS = [
  { value: "phi-phi", label: "Phi Phi Islands" },
  { value: "james-bond", label: "James Bond Island" },
  { value: "similan", label: "Similan Islands" },
];

describe("CreatableSelect", () => {
  it("renders trigger with placeholder and selected option", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
        placeholder="Choose destination"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Phi Phi Islands");
  });

  it("opens menu when clicked and displays options", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText("James Bond Island")).toBeInTheDocument();
    expect(screen.getByText("Similan Islands")).toBeInTheDocument();
  });

  it("filters options when typing into search input", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-creatable-search-input");
    fireEvent.change(searchInput, { target: { value: "bond" } });

    expect(screen.getByText("James Bond Island")).toBeInTheDocument();
    expect(screen.queryByText("Similan Islands")).not.toBeInTheDocument();
  });

  it("shows create option action when search does not match existing options", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-creatable-search-input");
    fireEvent.change(searchInput, { target: { value: "Koh Samui" } });

    const createBtn = screen.getByTestId("test-creatable-create-option-btn");
    expect(createBtn).toBeInTheDocument();
    expect(createBtn).toHaveTextContent('Add "Koh Samui"');
  });

  it("does not show create option action when query matches existing option exactly (case-insensitive)", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-creatable-search-input");
    fireEvent.change(searchInput, { target: { value: "phi phi islands" } });

    expect(screen.queryByTestId("test-creatable-create-option-btn")).not.toBeInTheDocument();
  });

  it("creates custom option, selects it immediately, and calls onChange and onCreateOption", () => {
    const handleChange = vi.fn();
    const handleCreate = vi.fn();

    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
        onChange={handleChange}
        onCreateOption={handleCreate}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));

    const searchInput = screen.getByTestId("test-creatable-search-input");
    fireEvent.change(searchInput, { target: { value: "Racha Noi Island" } });

    const createBtn = screen.getByTestId("test-creatable-create-option-btn");
    fireEvent.click(createBtn);

    expect(handleCreate).toHaveBeenCalledWith({
      value: "Racha Noi Island",
      label: "Racha Noi Island",
    });
    expect(handleChange).toHaveBeenCalledWith("Racha Noi Island");
  });

  it("supports keyboard navigation: escape closes menu", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="phi-phi"
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    const searchInput = screen.getByTestId("test-creatable-search-input");
    fireEvent.keyDown(searchInput, { key: "Escape" });

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("retains custom value even if not originally in initialOptions list", () => {
    render(
      <CreatableSelect
        id="test-creatable"
        options={TEST_OPTIONS}
        value="Koh Tao Diving"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveTextContent("Koh Tao Diving");
  });

  it("handles loading, error, and empty states properly when creatable=false", () => {
    const { rerender } = render(
      <CreatableSelect
        id="test-loading"
        options={[]}
        isLoading={true}
        creatable={false}
      />
    );

    const loadingTrigger = screen.getByRole("combobox");
    expect(loadingTrigger).toHaveTextContent("Loading...");
    expect(loadingTrigger).toBeDisabled();

    rerender(
      <CreatableSelect
        id="test-error"
        options={[]}
        errorMessage="Failed to load items"
        creatable={false}
      />
    );
    expect(screen.getByRole("combobox")).toHaveTextContent("Failed to load items");

    rerender(
      <CreatableSelect
        id="test-empty"
        options={[]}
        emptyMessage="No available items"
        creatable={false}
      />
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("No available items")).toBeInTheDocument();
    expect(screen.queryByTestId("test-empty-create-option-btn")).not.toBeInTheDocument();
  });
});
