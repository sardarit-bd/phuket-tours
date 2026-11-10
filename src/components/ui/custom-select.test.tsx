import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomSelect, SelectOption } from "./custom-select";

const TEST_OPTIONS: SelectOption<number>[] = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page", disabled: true },
];

describe("CustomSelect component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with selected label and size styling", () => {
    render(
      <CustomSelect
        id="page-size-select"
        options={TEST_OPTIONS}
        value={25}
        size="sm"
        aria-label="Select rows"
      />
    );

    const trigger = screen.getByRole("combobox", { name: "Select rows" });
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent("25 per page");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger.className).toContain("h-8");
  });

  it("opens menu and selects option on click", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        id="page-size-select"
        options={TEST_OPTIONS}
        value={10}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const option50 = screen.getByRole("option", { name: "50 per page" });
    expect(option50).toBeInTheDocument();

    fireEvent.click(option50);
    expect(onChange).toHaveBeenCalledWith(50);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("supports controlled state updates", () => {
    const { rerender } = render(
      <CustomSelect
        options={TEST_OPTIONS}
        value={10}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("10 per page");

    rerender(
      <CustomSelect
        options={TEST_OPTIONS}
        value={50}
      />
    );

    expect(screen.getByRole("combobox")).toHaveTextContent("50 per page");
  });

  it("supports disabled state", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        options={TEST_OPTIONS}
        value={10}
        onChange={onChange}
        disabled={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();

    fireEvent.click(trigger);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not select disabled options", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        options={TEST_OPTIONS}
        value={10}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    const disabledOption = screen.getByRole("option", { name: "100 per page" });
    expect(disabledOption).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(disabledOption);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("supports keyboard navigation (ArrowDown, Enter, Escape)", () => {
    const onChange = vi.fn();
    render(
      <CustomSelect
        options={TEST_OPTIONS}
        value={10}
        onChange={onChange}
      />
    );

    const trigger = screen.getByRole("combobox");
    trigger.focus();

    // Open via ArrowDown
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    // Navigate to next option (25)
    fireEvent.keyDown(trigger, { key: "ArrowDown" });

    // Select with Enter
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(25);
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Reopen and close via Escape
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });
});
