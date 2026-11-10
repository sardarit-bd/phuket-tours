import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CustomDatePicker, formatISODate } from "./custom-date-picker";

describe("CustomDatePicker", () => {
  it("renders trigger button with placeholder or provided date", () => {
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
        placeholder="Choose date"
      />
    );

    const trigger = screen.getByTestId("test-picker-trigger");
    expect(trigger).toHaveTextContent("2026-11-15");
  });

  it("opens popover on click and renders month/year and navigation controls", () => {
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));

    expect(screen.getByTestId("test-picker-popover")).toBeInTheDocument();
    expect(screen.getByTestId("test-picker-month-year")).toHaveTextContent("November 2026");
    expect(screen.getByTestId("test-picker-prev-month-btn")).toBeInTheDocument();
    expect(screen.getByTestId("test-picker-next-month-btn")).toBeInTheDocument();
    expect(screen.getByTestId("test-picker-today-btn")).toBeInTheDocument();
  });

  it("navigates to previous and next month", () => {
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));

    const prevBtn = screen.getByTestId("test-picker-prev-month-btn");
    fireEvent.click(prevBtn);
    expect(screen.getByTestId("test-picker-month-year")).toHaveTextContent("October 2026");

    const nextBtn = screen.getByTestId("test-picker-next-month-btn");
    fireEvent.click(nextBtn);
    fireEvent.click(nextBtn);
    expect(screen.getByTestId("test-picker-month-year")).toHaveTextContent("December 2026");
  });

  it("selects a date and fires onChange with YYYY-MM-DD", () => {
    const handleChange = vi.fn();
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
        onChange={handleChange}
        disablePastDates={false}
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));

    const targetDay = screen.getByTestId("test-picker-day-2026-11-20");
    fireEvent.click(targetDay);

    expect(handleChange).toHaveBeenCalledWith("2026-11-20");
    // Popover closes after selection
    expect(screen.queryByTestId("test-picker-popover")).not.toBeInTheDocument();
  });

  it("today shortcut navigates to current month and selects today's date", () => {
    const handleChange = vi.fn();
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-05-10"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));
    const todayBtn = screen.getByTestId("test-picker-today-btn");
    fireEvent.click(todayBtn);

    const todayISO = formatISODate(new Date());
    expect(handleChange).toHaveBeenCalledWith(todayISO);
  });

  it("shows visual indicators for existing availability entries", () => {
    const existing = [
      { date: "2026-11-10", isAvailable: true, capacity: 30 },
      { date: "2026-11-12", isAvailable: false },
    ];

    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
        existingDates={existing}
        disablePastDates={false}
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));

    const availableBtn = screen.getByTestId("test-picker-day-2026-11-10");
    expect(availableBtn).toHaveAttribute("aria-label", expect.stringContaining("available"));

    const blockedBtn = screen.getByTestId("test-picker-day-2026-11-12");
    expect(blockedBtn).toHaveAttribute("aria-label", expect.stringContaining("blocked"));
  });

  it("disables past dates when disablePastDates is true", () => {
    render(
      <CustomDatePicker
        id="test-picker"
        value="2026-11-15"
        minDate="2026-11-10"
        disablePastDates={true}
      />
    );

    fireEvent.click(screen.getByTestId("test-picker-trigger"));

    const pastDay = screen.getByTestId("test-picker-day-2026-11-05");
    expect(pastDay).toBeDisabled();

    const futureDay = screen.getByTestId("test-picker-day-2026-11-20");
    expect(futureDay).not.toBeDisabled();
  });
});
