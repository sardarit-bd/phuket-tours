import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BasicInfoTab, type BasicInfoFormData } from "./basic-info-tab";

const MOCK_BASIC_INFO: BasicInfoFormData = {
  name: "Phi Phi Early Bird Tour",
  slug: "phi-phi-early-bird-tour",
  subtitle: "Beat the crowds to Maya Bay",
  description: "Experience the ultimate early sunrise tour.",
  destination: "Phi Phi Islands",
  city: "Phuket",
  country: "Thailand",
  departurePoint: "Royal Phuket Marina",
  duration: "Full Day (8 Hours)",
  durationCategory: "full-day",
  tourType: "island-tours",
  groupSize: "Max 20 travelers",
  languages: ["English", "Thai"],
  providerName: "Phuket Island Travels",
  providerId: "",
  badge: "Bestseller",
};

describe("BasicInfoTab component", () => {
  it("renders form inputs with simplified non-technical labels", () => {
    render(
      <BasicInfoTab
        data={MOCK_BASIC_INFO}
        onChange={vi.fn()}
        errors={{}}
        isEditMode={false}
      />
    );

    // Simplified labels
    expect(screen.getByText(/Tour Name/i)).toBeInTheDocument();
    expect(screen.getByText(/Short Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Departure Point \/ Meeting Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour Duration/i)).toBeInTheDocument();
    expect(screen.getByText(/Duration Type/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tour Category/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Maximum Group Size/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour Operator/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Highlight/i).length).toBeGreaterThan(0);

    // Values
    expect(screen.getByDisplayValue("Phi Phi Early Bird Tour")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Beat the crowds to Maya Bay")).toBeInTheDocument();
    expect(screen.getByTestId("tour-form-destination-select")).toHaveTextContent("Phi Phi Islands");
    expect(screen.getByTestId("tour-form-type-select")).toHaveTextContent("Island Tours & Island Hopping");
  });

  it("does not expose a URL slug field in the normal Admin form", () => {
    render(
      <BasicInfoTab
        data={MOCK_BASIC_INFO}
        onChange={vi.fn()}
        errors={{}}
        isEditMode={false}
      />
    );

    expect(screen.queryByLabelText(/URL Slug/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/url-slug/i)).not.toBeInTheDocument();
  });

  it("automatically generates slug from Tour Name in create mode", () => {
    const handleChange = vi.fn();
    render(
      <BasicInfoTab
        data={MOCK_BASIC_INFO}
        onChange={handleChange}
        errors={{}}
        isEditMode={false}
      />
    );

    const nameInput = screen.getByTestId("tour-form-name-input");
    fireEvent.change(nameInput, { target: { value: "Similan Islands Day Trip!" } });

    expect(handleChange).toHaveBeenCalledWith({
      name: "Similan Islands Day Trip!",
      slug: "similan-islands-day-trip",
    });
  });

  it("does not overwrite slug when editing an existing tour", () => {
    const handleChange = vi.fn();
    render(
      <BasicInfoTab
        data={MOCK_BASIC_INFO}
        onChange={handleChange}
        errors={{}}
        isEditMode={true}
      />
    );

    const nameInput = screen.getByTestId("tour-form-name-input");
    fireEvent.change(nameInput, { target: { value: "Phi Phi VIP Luxury Cruise" } });

    // In edit mode, slug is preserved and not auto-overwritten
    expect(handleChange).toHaveBeenCalledWith({
      name: "Phi Phi VIP Luxury Cruise",
    });
  });

  it("uses predefined destinations and does NOT allow free-form custom destination creation", () => {
    render(
      <BasicInfoTab
        data={MOCK_BASIC_INFO}
        onChange={vi.fn()}
        errors={{}}
        isEditMode={false}
      />
    );

    // No creatable option button or + Add custom option
    expect(screen.queryByTestId("tour-form-destination-create-option-btn")).not.toBeInTheDocument();
    expect(screen.queryByText(/\+ Add custom option/i)).not.toBeInTheDocument();
  });

  it("preserves existing saved destination when editing even if not in predefined list", () => {
    const customDestination = "Koh Yao Yai Special Island";
    render(
      <BasicInfoTab
        data={{
          ...MOCK_BASIC_INFO,
          destination: customDestination,
        }}
        onChange={vi.fn()}
        errors={{}}
        isEditMode={true}
      />
    );

    // The custom destination must be preserved in the select
    const selectTrigger = screen.getByTestId("tour-form-destination-select");
    expect(selectTrigger).toHaveTextContent(customDestination);
  });

  it("preserves existing saved tour category when editing even if not in predefined list", () => {
    const customCategory = "Helicopter & Aerial Tours";
    render(
      <BasicInfoTab
        data={{
          ...MOCK_BASIC_INFO,
          tourType: customCategory,
        }}
        onChange={vi.fn()}
        errors={{}}
        isEditMode={true}
      />
    );

    const selectTrigger = screen.getByTestId("tour-form-type-select");
    expect(selectTrigger).toHaveTextContent(customCategory);
  });
});
