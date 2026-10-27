import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublicShell } from "./public-shell";

const mockUsePathname = vi.fn();

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock Header and Footer to verify presence/absence
vi.mock("./header", () => ({
  Header: () => <header data-testid="public-header">Public Header</header>,
}));

vi.mock("./footer", () => ({
  Footer: () => <footer data-testid="public-footer">Public Footer</footer>,
}));

describe("PublicShell Architecture", () => {
  it("renders the public header and footer on public routes like / and /tours", () => {
    mockUsePathname.mockReturnValue("/");

    render(
      <PublicShell>
        <div data-testid="home-content">Home Page Content</div>
      </PublicShell>
    );

    expect(screen.getByTestId("public-header")).toBeInTheDocument();
    expect(screen.getByTestId("home-content")).toBeInTheDocument();
    expect(screen.getByTestId("public-footer")).toBeInTheDocument();
  });

  it("does NOT render the public header or footer on the /dashboard route", () => {
    mockUsePathname.mockReturnValue("/dashboard");

    render(
      <PublicShell>
        <div data-testid="dashboard-content">Dashboard Standalone Content</div>
      </PublicShell>
    );

    expect(screen.queryByTestId("public-header")).not.toBeInTheDocument();
    expect(screen.queryByTestId("public-footer")).not.toBeInTheDocument();
    expect(screen.getByTestId("dashboard-content")).toBeInTheDocument();
  });
});
