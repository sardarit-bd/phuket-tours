import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, { setCredentials, setInitialized } from "@/features/auth/slices/auth-slice";
import CheckoutPage from "./page";

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams("tourId=tour-123");

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  useSearchParams: () => mockSearchParams,
}));

// Mock Next Image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const mockTour = {
  id: "tour-123",
  title: "Phi Phi Island Luxury Day Tour",
  destination: "Phi Phi Islands, Thailand",
  duration: "8 hours",
  featuredImage: "https://images.unsplash.com/photo-1537996194471-e657df975ab4",
  description: "Experience the crystal clear waters and limestone cliffs of Maya Bay and Bamboo Island.",
  price: {
    amount: 150,
    currency: "USD",
  },
  pricingTiers: [
    { tierName: "Adult Ticket", price: 150 },
    { tierName: "Child Ticket (4-12)", price: 90 },
    { tierName: "Infant (0-3)", price: 0 },
  ],
};

const { useGetTourByIdQuery } = vi.hoisted(() => ({
  useGetTourByIdQuery: vi.fn(),
}));

vi.mock("@/features/tours/api/tours-api", () => ({
  useGetTourByIdQuery,
}));

function createMockStore(preloadedUser?: any, initialized: boolean = true) {
  const store = configureStore({
    reducer: {
      auth: authReducer,
    },
  });

  if (initialized) {
    store.dispatch(setInitialized(true));
  }

  if (preloadedUser) {
    store.dispatch(setCredentials(preloadedUser));
  }

  return store;
}

describe("CheckoutPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams("tourId=tour-123");
    useGetTourByIdQuery.mockReturnValue({
      data: mockTour,
      isLoading: false,
      isError: false,
    });
  });

  it("redirects unauthenticated users to sign-in with return URL", async () => {
    const store = createMockStore(null, true);

    render(
      <Provider store={store}>
        <CheckoutPage />
      </Provider>
    );

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        expect.stringContaining("/sign-in?redirect=")
      );
    });

    const callArg = mockReplace.mock.calls[0][0];
    expect(callArg).toContain(encodeURIComponent("/checkout?tourId=tour-123"));
  });

  it("renders tour details and pricing breakdown for authenticated customers", async () => {
    const store = createMockStore({
      id: "cust-1",
      email: "traveler@example.com",
      name: "John Traveler",
      role: "customer",
    });

    render(
      <Provider store={store}>
        <CheckoutPage />
      </Provider>
    );

    expect(await screen.findByText("Phi Phi Island Luxury Day Tour")).toBeInTheDocument();
    expect(screen.getByText("Phi Phi Islands, Thailand")).toBeInTheDocument();

    expect(screen.getByText("Total Amount")).toBeInTheDocument();
    expect(screen.getByText("3. Payment Method Selection")).toBeInTheDocument();
    expect(screen.getByTestId("checkout-total-price")).toHaveTextContent("$150");
  });

  it("increments guest counters and dynamically updates price breakdown", async () => {
    const store = createMockStore({
      id: "cust-1",
      email: "traveler@example.com",
      name: "John Traveler",
      role: "customer",
    });

    render(
      <Provider store={store}>
        <CheckoutPage />
      </Provider>
    );

    await screen.findByText("Phi Phi Island Luxury Day Tour");

    // Adults counter starts at 1 ($150). Increment children (1 x $90)
    const childIncrement = screen.getByTestId("children-increment");
    fireEvent.click(childIncrement);

    // 1 adult ($150) + 1 child ($90) = $240
    await waitFor(() => {
      expect(screen.getByTestId("checkout-total-price")).toHaveTextContent("$240");
    });
  });

  it("renders PayPal as a clearly disabled 'Coming Soon' payment option", async () => {
    const store = createMockStore({
      id: "cust-1",
      email: "traveler@example.com",
      name: "John Traveler",
      role: "customer",
    });

    render(
      <Provider store={store}>
        <CheckoutPage />
      </Provider>
    );

    await screen.findByText("Phi Phi Island Luxury Day Tour");

    expect(screen.getByText("PayPal")).toBeInTheDocument();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
    const paypalDisabledContainer = screen.getByTestId("payment-method-paypal-disabled");
    const disabledInput = paypalDisabledContainer.querySelector("input");
    expect(disabledInput).toBeDisabled();
  });

  it("requires reference when Bank Transfer payment method is selected", async () => {
    const store = createMockStore({
      id: "cust-1",
      email: "traveler@example.com",
      name: "John Traveler",
      role: "customer",
    });

    render(
      <Provider store={store}>
        <CheckoutPage />
      </Provider>
    );

    await screen.findByText("Phi Phi Island Luxury Day Tour");

    // Select Bank Transfer
    const bankRadio = screen.getByDisplayValue("BANK_TRANSFER");
    fireEvent.click(bankRadio);

    // Bank transfer details notice is displayed
    expect(screen.getByText("Direct Bank Transfer")).toBeInTheDocument();
    expect(screen.getByText(/Bangkok Bank \(Phuket Branch\)/)).toBeInTheDocument();

    // Click submit without entering reference
    const submitBtn = screen.getByTestId("checkout-submit-btn");
    fireEvent.click(submitBtn);

    // Shows validation error
    await waitFor(() => {
      expect(
        screen.getByText("Please provide your bank transfer transaction reference.")
      ).toBeInTheDocument();
    });
  });
});
