import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SelectedDateList } from "./selected-date-list";
import type { SpecificDateAvailability } from "./availability-tab";

const MOCK_DATES: SpecificDateAvailability[] = [
  { date: "2026-11-20", isAvailable: true, capacity: 25 },
  { date: "2026-11-25", isAvailable: false },
];

describe("SelectedDateList component", () => {
  it("renders empty state when no dates are provided", () => {
    render(
      <SelectedDateList
        dates={[]}
        defaultCapacity={20}
        onUpdateEntry={vi.fn()}
        onRemoveDate={vi.fn()}
      />
    );

    expect(screen.getByTestId("selected-date-list-empty")).toBeInTheDocument();
    expect(
      screen.getByText(/No specific date overrides added yet/i)
    ).toBeInTheDocument();
  });

  it("renders configured dates with status badges and capacity", () => {
    render(
      <SelectedDateList
        dates={MOCK_DATES}
        defaultCapacity={20}
        onUpdateEntry={vi.fn()}
        onRemoveDate={vi.fn()}
      />
    );

    expect(screen.getByText("2026-11-20")).toBeInTheDocument();
    expect(screen.getByText(/Available \(25 seats\)/i)).toBeInTheDocument();

    expect(screen.getByText("2026-11-25")).toBeInTheDocument();
    expect(screen.getAllByText(/Unavailable/i).length).toBeGreaterThan(0);
  });

  it("calls onRemoveDate when delete button is clicked", () => {
    const handleRemove = vi.fn();
    render(
      <SelectedDateList
        dates={MOCK_DATES}
        defaultCapacity={20}
        onUpdateEntry={vi.fn()}
        onRemoveDate={handleRemove}
      />
    );

    const removeBtn = screen.getByLabelText("Remove date 2026-11-20");
    fireEvent.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith("2026-11-20");
  });

  it("triggers inline editing and saves updated capacity and status", () => {
    const handleUpdate = vi.fn();
    render(
      <SelectedDateList
        dates={MOCK_DATES}
        defaultCapacity={20}
        onUpdateEntry={handleUpdate}
        onRemoveDate={vi.fn()}
      />
    );

    // Click edit button for first date
    const editBtn = screen.getByLabelText("Edit date 2026-11-20");
    fireEvent.click(editBtn);

    // Inline controls should be visible
    const statusTrigger = screen.getByTestId("inline-edit-status-2026-11-20").querySelector("button");
    const capacityInput = screen.getByTestId("inline-edit-capacity-2026-11-20");
    const saveBtn = screen.getByTestId("inline-save-2026-11-20");

    if (statusTrigger) {
      fireEvent.click(statusTrigger);
      const blockedOpt = screen.getByRole("option", { name: "Unavailable" });
      fireEvent.click(blockedOpt);
    }
    fireEvent.change(capacityInput, { target: { value: "0" } });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith({
      date: "2026-11-20",
      isAvailable: false,
      capacity: 0,
    });
  });
});
