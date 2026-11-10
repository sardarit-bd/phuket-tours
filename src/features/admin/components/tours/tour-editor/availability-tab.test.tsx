import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AvailabilityTab, type AvailabilityFormData } from "./availability-tab";

const INITIAL_DATA: AvailabilityFormData = {
  scheduleDetails: {
    isDaily: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    timeSlots: ["08:00 AM"],
    operatingHours: "08:00 AM - 05:00 PM",
  },
  capacity: 25,
  specificDates: [
    { date: "2026-12-25", isAvailable: false, capacity: 0 },
  ],
  removedDates: [],
};

describe("AvailabilityTab component", () => {
  it("renders departure schedule, passenger capacity, and specific dates list", () => {
    render(<AvailabilityTab data={INITIAL_DATA} onChange={vi.fn()} />);

    expect(screen.getByText("1. General Departure Schedule")).toBeInTheDocument();
    expect(screen.getByText("2. Standard Guest Capacity")).toBeInTheDocument();
    expect(screen.getByText("3. Selected Dates & Availability")).toBeInTheDocument();
    expect(screen.getByText("2026-12-25")).toBeInTheDocument();
    expect(screen.getAllByText(/Unavailable/i).length).toBeGreaterThan(0);
  });

  it("adds a new specific date override with available status and custom capacity", () => {
    const handleChange = vi.fn();
    render(<AvailabilityTab data={INITIAL_DATA} onChange={handleChange} />);

    // Open calendar date picker
    const trigger = screen.getByTestId("new-specific-date-input-trigger");
    fireEvent.click(trigger);

    // Navigate to December 2026
    const nextMonthBtn = screen.getByTestId("new-specific-date-input-next-month-btn");
    fireEvent.click(nextMonthBtn);

    // Pick December 31
    const dayBtn = screen.getByTestId("new-specific-date-input-day-2026-12-31");
    fireEvent.click(dayBtn);

    // Select status = available
    const statusTrigger = screen.getByTestId("new-date-status-select").querySelector("button");
    if (statusTrigger) {
      fireEvent.click(statusTrigger);
      const availOpt = screen.getByRole("option", { name: "Available" });
      fireEvent.click(availOpt);
    }

    // Set capacity override
    const capacityInput = screen.getByTestId("new-date-capacity-input");
    fireEvent.change(capacityInput, { target: { value: "40" } });

    // Click Add Date
    const addBtn = screen.getByTestId("add-specific-date-btn");
    expect(addBtn).toHaveTextContent("Add Date");
    fireEvent.click(addBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specificDates: expect.arrayContaining([
          { date: "2026-12-25", isAvailable: false, capacity: 0 },
          { date: "2026-12-31", isAvailable: true, capacity: 40 },
        ]),
      })
    );
  });

  it("prevents duplicate dates by updating existing entry when selected", () => {
    const handleChange = vi.fn();
    render(<AvailabilityTab data={INITIAL_DATA} onChange={handleChange} />);

    // Select existing date: 2026-12-25
    const trigger = screen.getByTestId("new-specific-date-input-trigger");
    fireEvent.click(trigger);
    const nextMonthBtn = screen.getByTestId("new-specific-date-input-next-month-btn");
    fireEvent.click(nextMonthBtn);
    const dayBtn = screen.getByTestId("new-specific-date-input-day-2026-12-25");
    fireEvent.click(dayBtn);

    // Button should now indicate update
    const addBtn = screen.getByTestId("add-specific-date-btn");
    expect(addBtn).toHaveTextContent("Update Date");

    // Change status to available
    const updateStatusTrigger = screen.getByTestId("new-date-status-select").querySelector("button");
    if (updateStatusTrigger) {
      fireEvent.click(updateStatusTrigger);
      const availOpt = screen.getByRole("option", { name: "Available" });
      fireEvent.click(availOpt);
    }

    // Change capacity
    const capacityInput = screen.getByTestId("new-date-capacity-input");
    fireEvent.change(capacityInput, { target: { value: "15" } });

    fireEvent.click(addBtn);

    // Should update in place without adding a second entry
    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specificDates: [
          { date: "2026-12-25", isAvailable: true, capacity: 15 },
        ],
      })
    );
  });

  it("removes a date from active list and records it in removedDates for blocked sync", () => {
    const handleChange = vi.fn();
    render(<AvailabilityTab data={INITIAL_DATA} onChange={handleChange} />);

    const removeBtn = screen.getByLabelText("Remove date 2026-12-25");
    fireEvent.click(removeBtn);

    expect(handleChange).toHaveBeenCalledWith(
      expect.objectContaining({
        specificDates: [],
        removedDates: ["2026-12-25"],
      })
    );
  });
});
