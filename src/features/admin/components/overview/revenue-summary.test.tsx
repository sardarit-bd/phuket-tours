import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RevenueSummary } from "./revenue-summary";
import type {
  AdminRevenueReportData,
  AdminPaymentsReportData,
} from "../../types/admin";

describe("RevenueSummary component", () => {
  const realisticRevenueFixture: AdminRevenueReportData = {
    filters: {
      from: null,
      to: null,
      serviceType: null,
      agentId: null,
    },
    revenue: 95400.0,
    bookedValue: 125000.5,
    collectedPayments: 92000.0,
    outstandingBalance: 33000.5,
  };

  const realisticPaymentsFixture: AdminPaymentsReportData = {
    filters: {
      from: null,
      to: null,
      serviceType: null,
      agentId: null,
    },
    byStatus: [
      { status: "VERIFIED", count: 25, totalAmount: 92000 },
      { status: "SUBMITTED", count: 3, totalAmount: 4500 },
    ],
    verifiedByMethod: [
      { method: "BANK_TRANSFER", count: 20, totalAmount: 75000 },
      { method: "CASH", count: 5, totalAmount: 17000 },
    ],
    reconciliation: {
      paidBookingsValue: 92000,
      verifiedPaymentsValue: 92000,
      difference: 0,
      pendingVerificationCount: 3,
      pendingVerificationValue: 4500,
    },
  };

  it("renders all 4 financial metrics with un-denominated formatting when currency is not provided", () => {
    render(
      <RevenueSummary
        revenueData={realisticRevenueFixture}
        paymentsData={realisticPaymentsFixture}
      />
    );

    // Completed revenue
    expect(screen.getByTestId("metric-revenue-value")).toHaveTextContent("95,400.00");
    // Booked value
    expect(screen.getByTestId("metric-booked-value-value")).toHaveTextContent("125,000.50");
    // Collected payments
    expect(screen.getByTestId("metric-collected-value")).toHaveTextContent("92,000.00");
    // Outstanding balance
    expect(screen.getByTestId("metric-outstanding-value")).toHaveTextContent("33,000.50");

    // Does NOT silently assume USD or THB when no currency is returned by backend
    expect(screen.getByTestId("metric-revenue-value").textContent).not.toContain("$");
    expect(screen.getByTestId("metric-revenue-value").textContent).not.toContain("THB");
  });

  it("formats monetary amounts with returned currency when backend provides one", () => {
    render(
      <RevenueSummary
        revenueData={realisticRevenueFixture}
        currency="USD"
      />
    );

    expect(screen.getByTestId("metric-revenue-value")).toHaveTextContent("95,400.00");
    expect(screen.getByText("Currency: USD")).toBeInTheDocument();
  });

  it("renders reconciliation panel when payments data is provided", () => {
    render(
      <RevenueSummary
        revenueData={realisticRevenueFixture}
        paymentsData={realisticPaymentsFixture}
      />
    );

    expect(screen.getByTestId("payment-reconciliation-panel")).toBeInTheDocument();
    expect(screen.getByText("Balanced")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });

  it("handles missing/null revenue data gracefully without fabricating numbers", () => {
    render(<RevenueSummary revenueData={null} />);

    expect(screen.getByTestId("metric-revenue-value")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-booked-value-value")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-collected-value")).toHaveTextContent("—");
    expect(screen.getByTestId("metric-outstanding-value")).toHaveTextContent("—");
  });

  it("communicates confirmed zero activity clearly without confusing it with missing data", () => {
    const zeroRevenueFixture: AdminRevenueReportData = {
      filters: { from: null, to: null, serviceType: null, agentId: null },
      revenue: 0,
      bookedValue: 0,
      collectedPayments: 0,
      outstandingBalance: 0,
    };

    render(<RevenueSummary revenueData={zeroRevenueFixture} />);

    // Preserves actual 0.00 numeric representation
    expect(screen.getByTestId("metric-revenue-value")).toHaveTextContent("0.00");
    expect(screen.getByTestId("metric-booked-value-value")).toHaveTextContent("0.00");
    expect(screen.getByTestId("metric-collected-value")).toHaveTextContent("0.00");
    expect(screen.getByTestId("metric-outstanding-value")).toHaveTextContent("0.00");

    // Displays contextual notice distinguishing confirmed zero balances from an error
    expect(screen.getByTestId("financial-empty-context")).toBeInTheDocument();
    expect(screen.getByTestId("financial-empty-context")).toHaveTextContent(
      "No booking or financial activity recorded for this period"
    );
  });

  it("renders compact payment comparison visualization with distinct metric definitions", () => {
    render(
      <RevenueSummary
        revenueData={realisticRevenueFixture}
        paymentsData={realisticPaymentsFixture}
      />
    );

    const comparisonChart = screen.getByTestId("payment-comparison-chart");
    expect(comparisonChart).toBeInTheDocument();

    // Contains comparison titles and labels
    expect(comparisonChart).toHaveTextContent("Payment Verification Comparison");
    expect(comparisonChart).toHaveTextContent("Paid Booking Value (Invoiced Target)");
    expect(comparisonChart).toHaveTextContent("Verified Payments (Confirmed Funds Collected)");
    expect(comparisonChart).toHaveTextContent("Pending Verification (3 items in queue)");

    // Clarification callout to protect data integrity and avoid equating incompatible values
    expect(comparisonChart).toHaveTextContent("Metric Integrity:");
    expect(
      comparisonChart
    ).toHaveTextContent(
      "Pending Verification represents unreviewed payment proof uploads awaiting verification and is not yet counted as collected revenue."
    );
  });

  it("handles error state and triggers onRetry callback when clicked", () => {
    const handleRetry = vi.fn();

    render(
      <RevenueSummary
        revenueData={null}
        error={new Error("Network Error")}
        onRetry={handleRetry}
      />
    );

    expect(screen.getByTestId("revenue-summary-error")).toBeInTheDocument();
    expect(screen.getByText("Failed to load financial revenue analytics")).toBeInTheDocument();

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
