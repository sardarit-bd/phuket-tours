import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateAgentBookingDialog } from "./create-agent-booking-dialog";

const MOCK_TOURS = [
  {
    id: "tour-1",
    title: "Phi Phi Island Speedboat Tour",
    slug: "phi-phi-island-tour",
    price: { amount: 120, currency: "USD", hasPrice: true },
    pricingTiers: [
      { tierName: "Adult", price: 120 },
      { tierName: "Child", price: 80 },
    ],
  },
  {
    id: "tour-2",
    title: "James Bond Island Luxury Catamaran",
    slug: "james-bond-catamaran",
    price: { amount: 150, currency: "USD", hasPrice: true },
    pricingTiers: [],
  },
];

const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+66 81 234 5678",
  },
  {
    id: "cust-2",
    name: "Bob Williams",
    email: "bob@example.com",
    phone: null,
  },
];

let mockToursState: any = {
  data: { data: MOCK_TOURS },
  isLoading: false,
  isError: false,
  error: null,
};

let mockCustomersState: any = {
  data: { data: { items: MOCK_CUSTOMERS } },
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetToursQuery: () => mockToursState,
}));

vi.mock("../../api/agent-api", () => ({
  useGetAgentCustomersQuery: () => mockCustomersState,
  useGetAgentPricingLimitsQuery: () => ({ data: { data: { maxDiscountPercentage: 20 } } }),
  useCreateAgentCustomerMutation: () => [vi.fn(), { isLoading: false }],
  useCreateAgentBookingMutation: () => [vi.fn(), { isLoading: false }],
  useGenerateAgentPaymentLinkMutation: () => [vi.fn(), { isLoading: false }],
}));

describe("CreateAgentBookingDialog Dropdowns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToursState = {
      data: { data: MOCK_TOURS },
      isLoading: false,
      isError: false,
      error: null,
    };
    mockCustomersState = {
      data: { data: { items: MOCK_CUSTOMERS } },
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it("renders CreateAgentBookingDialog with custom dropdowns for Tours and Past Clients", () => {
    render(
      <CreateAgentBookingDialog isOpen={true} onClose={vi.fn()} />
    );

    // Dialog title
    expect(screen.getByText("Create Partner Booking")).toBeInTheDocument();

    // Tour dropdown combobox
    const tourCombobox = screen.getByTestId("agent-booking-tour-select");
    expect(tourCombobox).toBeInTheDocument();

    // Verify tour auto-selected
    expect(tourCombobox).toHaveTextContent("Phi Phi Island Speedboat Tour");

    // Open tour dropdown and test search
    const tourTriggerBtn = tourCombobox.querySelector("button")!;
    fireEvent.click(tourTriggerBtn);

    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getByText(/James Bond Island Luxury Catamaran/)).toBeInTheDocument();

    const tourSearchInput = screen.getByTestId("agent-tour-select-search-input");
    fireEvent.change(tourSearchInput, { target: { value: "James" } });

    expect(screen.getByTestId("agent-tour-select-option-tour-2")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-tour-select-option-tour-1")).not.toBeInTheDocument();

    // Select James Bond Tour
    fireEvent.click(screen.getByTestId("agent-tour-select-option-tour-2"));
    expect(tourCombobox).toHaveTextContent("James Bond Island Luxury Catamaran");

    // Switch to Past Clients mode
    const pastClientsTab = screen.getByTestId("agent-customer-mode-existing");
    fireEvent.click(pastClientsTab);

    // Past Clients custom dropdown
    const clientCombobox = screen.getByTestId("agent-existing-customer-select");
    expect(clientCombobox).toBeInTheDocument();

    // Open past clients dropdown
    const clientTriggerBtn = clientCombobox.querySelector("button")!;
    fireEvent.click(clientTriggerBtn);

    expect(screen.getByText(/Bob Williams/)).toBeInTheDocument();

    const clientSearchInput = screen.getByTestId("agent-existing-customer-search-input");
    fireEvent.change(clientSearchInput, { target: { value: "Bob" } });

    expect(screen.getByTestId("agent-existing-customer-option-cust-2")).toBeInTheDocument();
    expect(screen.queryByTestId("agent-existing-customer-option-cust-1")).not.toBeInTheDocument();

    // Select Bob Williams
    fireEvent.click(screen.getByTestId("agent-existing-customer-option-cust-2"));
    expect(clientCombobox).toHaveTextContent("Bob Williams");
  });

  it("handles loading state for Tours and Past Clients dropdowns", () => {
    mockToursState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };
    mockCustomersState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };

    render(
      <CreateAgentBookingDialog isOpen={true} onClose={vi.fn()} />
    );

    const tourCombobox = screen.getByTestId("agent-booking-tour-select");
    expect(tourCombobox).toHaveTextContent("Loading...");
    expect(tourCombobox.querySelector("button")).toBeDisabled();
  });

  it("handles error state when Tours API fails", () => {
    mockToursState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: { status: 500, data: "Server Error" },
    };

    render(
      <CreateAgentBookingDialog isOpen={true} onClose={vi.fn()} />
    );

    const tourCombobox = screen.getByTestId("agent-booking-tour-select");
    expect(tourCombobox).toHaveTextContent("Failed to load tours. Please retry.");
  });

  it("handles empty state when no tours are available", () => {
    mockToursState = {
      data: { data: [] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(
      <CreateAgentBookingDialog isOpen={true} onClose={vi.fn()} />
    );

    const tourCombobox = screen.getByTestId("agent-booking-tour-select");
    const tourTriggerBtn = tourCombobox.querySelector("button")!;
    fireEvent.click(tourTriggerBtn);

    expect(screen.getByText("No tours available.")).toBeInTheDocument();
  });
});
