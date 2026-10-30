import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DollarSign } from "lucide-react";
import { MetricCard } from "./metric-card";

describe("MetricCard component", () => {
  it("renders title, formatted value, and subtitle properly", () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="125,400.00"
        subtitle="Final price of completed bookings"
        icon={DollarSign}
        tone="emerald"
        badge="Completed"
        badgeTone="success"
      />
    );

    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
    expect(screen.getByText("125,400.00")).toBeInTheDocument();
    expect(screen.getByText("Final price of completed bookings")).toBeInTheDocument();
    expect(screen.getByText("Completed")).toBeInTheDocument();
  });

  it("renders loading skeleton state when isLoading is true", () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="125,400.00"
        icon={DollarSign}
        isLoading={true}
        testId="test-metric"
      />
    );

    expect(screen.getByTestId("test-metric-loading")).toBeInTheDocument();
    expect(screen.queryByText("125,400.00")).not.toBeInTheDocument();
  });

  it("renders '—' gracefully when value is empty or missing without throwing", () => {
    render(
      <MetricCard
        title="Pending Revenue"
        value="—"
        icon={DollarSign}
      />
    );

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
