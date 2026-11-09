import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BookingSummaryCard } from "./booking-summary-card";
import { Tour } from "../types/tour";
import { makeStore, type AppStore } from "@/store";
import { setCredentials } from "@/features/auth/slices/auth-slice";

// Mock next/image (not directly used in this card, but safe)
vi.mock("next/image", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("react");
  return {
    __esModule: true,
    default: (props: any) =>
      mod.createElement("img", {
        src: props.src,
        alt: props.alt,
        "data-testid": "card-img",
      }),
  };
});

// Mock next/navigation (Link is used for the CTA)
vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "test-id" }),
}));

function makeTour(overrides: Partial<Tour> = {}): Tour {
  return {
    id: "t1",
    slug: "t1",
    title: "Test Tour",
    description: "desc",
    categoryId: "c",
    images: [],
    duration: "Full Day",
    durationCategory: "full-day",
    destination: "Phuket",
    destinationCategory: "phuket",
    tourType: "island-tours",
    price: { amount: 120, currency: "USD", hasPrice: true },
    ...overrides,
  };
}

function renderWithStore(ui: React.ReactElement, initialStore?: AppStore) {
  const store = initialStore || makeStore();
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store,
  };
}

describe("BookingSummaryCard", () => {
  it("displays the starting (adult base) price and per-person label", () => {
    renderWithStore(<BookingSummaryCard tour={makeTour()} />);
    expect(screen.getByText("per person")).toBeInTheDocument();
    // $120 via Intl.NumberFormat USD
    expect(screen.getByText("$120")).toBeInTheDocument();
  });

  it("shows struck-through original price and discount savings when discounted", () => {
    const tour = makeTour({
      price: {
        amount: 99,
        currency: "USD",
        originalAmount: 120,
        discountPercentage: 18,
        hasPrice: true,
      },
    });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    // Discounted price emphasized
    expect(screen.getByText("$99")).toBeInTheDocument();
    // Original struck-through
    expect(screen.getByText("$120")).toBeInTheDocument();
    // Savings line present
    expect(screen.getByText(/Save \$/)).toBeInTheDocument();
  });

  it("renders 'Free' for an explicit zero price", () => {
    const tour = makeTour({ price: { amount: 0, currency: "USD", hasPrice: true } });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("shows a subtle 'Contact for pricing' note when no valid price exists", () => {
    const tour = makeTour({
      price: { amount: 0, currency: "USD", hasPrice: false },
    });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    expect(screen.getByText("Contact for pricing")).toBeInTheDocument();
    // No per-person suffix in the no-price branch
    expect(screen.queryByText("per person")).toBeNull();
  });

  it("does not treat a zero as missing when hasPrice is true (free is valid)", () => {
    const tour = makeTour({ price: { amount: 0, currency: "USD", hasPrice: true } });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
    expect(screen.queryByText("Contact for pricing")).toBeNull();
  });

  it("links the Book Now CTA to sign-in with checkout redirect when unauthenticated", () => {
    renderWithStore(<BookingSummaryCard tour={makeTour()} />);
    const cta = screen.getByRole("link", { name: /book now/i });
    expect(cta).toHaveAttribute(
      "href",
      `/sign-in?redirect=${encodeURIComponent("/checkout?tourId=t1")}`
    );
  });

  it("links the Book Now CTA directly to checkout (not dashboard) when authenticated", () => {
    const store = makeStore();
    store.dispatch(
      setCredentials({
        id: "u1",
        email: "guest@example.com",
        name: "Guest User",
        role: "customer",
      })
    );

    renderWithStore(<BookingSummaryCard tour={makeTour()} />, store);
    const cta = screen.getByRole("link", { name: /book now/i });
    expect(cta).toHaveAttribute("href", "/checkout?tourId=t1");
    expect(cta).not.toHaveAttribute("href", expect.stringContaining("/dashboard"));
    expect(cta).not.toHaveAttribute("href", expect.stringContaining("/sign-in"));
  });

  it("renders package pricing tiers with 'Free of charge' for zero-valued tiers", () => {
    const tour = makeTour({
      pricingTiers: [
        { tierName: "Adult", price: 120 },
        { tierName: "Child (4-11)", price: 80 },
        { tierName: "Infant (0-3)", price: 0 },
      ],
    });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    expect(screen.getByText("Package pricing")).toBeInTheDocument();
    expect(screen.getByText("Adult")).toBeInTheDocument();
    expect(screen.getByText("Child (4-11)")).toBeInTheDocument();
    expect(screen.getByText("Free of charge")).toBeInTheDocument();
  });

  it("omits the package pricing block when no tiers exist", () => {
    renderWithStore(<BookingSummaryCard tour={makeTour()} />);
    expect(screen.queryByText("Package pricing")).toBeNull();
  });

  it("shows 'Up to N guests' when groupSize is set", () => {
    const tour = makeTour({ groupSize: "20" });
    renderWithStore(<BookingSummaryCard tour={tour} />);
    expect(screen.getByText("Up to 20 guests")).toBeInTheDocument();
  });
});
