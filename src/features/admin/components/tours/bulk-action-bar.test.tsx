import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkActionBar } from "./bulk-action-bar";

describe("BulkActionBar component", () => {
  it("does not render when selectedCount is 0", () => {
    const { container } = render(
      <BulkActionBar
        selectedCount={0}
        onClearSelection={vi.fn()}
        onInitiateBulkAction={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders when items are selected and triggers bulk action workflows", () => {
    const handleClearSelection = vi.fn();
    const handleInitiateBulkAction = vi.fn();

    render(
      <BulkActionBar
        selectedCount={3}
        onClearSelection={handleClearSelection}
        onInitiateBulkAction={handleInitiateBulkAction}
        isUpdating={false}
      />
    );

    expect(screen.getByText("3 selected")).toBeInTheDocument();

    // Trigger Publish Selected
    const publishBtn = screen.getByTestId("bulk-publish-button");
    fireEvent.click(publishBtn);
    expect(handleInitiateBulkAction).toHaveBeenCalledWith("PUBLISHED");

    // Trigger Unpublish Selected
    const unpublishBtn = screen.getByTestId("bulk-unpublish-button");
    fireEvent.click(unpublishBtn);
    expect(handleInitiateBulkAction).toHaveBeenCalledWith("UNPUBLISHED");

    // Trigger Move to Draft
    const draftBtn = screen.getByTestId("bulk-draft-button");
    fireEvent.click(draftBtn);
    expect(handleInitiateBulkAction).toHaveBeenCalledWith("DRAFT");

    // Clear selection
    const clearBtn = screen.getByLabelText("Clear selection");
    fireEvent.click(clearBtn);
    expect(handleClearSelection).toHaveBeenCalledTimes(1);
  });
});
