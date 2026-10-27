import * as React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ToursPage from "./page";
import { StoreProvider } from "@/store/provider";

describe("ToursPage", () => {
  it("renders hero section with title, eyebrow, and breadcrumb", () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(screen.getByText("EXPLORE PHUKET")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Tours & Experiences", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: /breadcrumb/i })
    ).toBeInTheDocument();
  });

  it("renders search bar, category navigation tabs, and filter sidebar", () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(
      screen.getByPlaceholderText(
        /search tours by name, destination or activity/i
      )
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
    expect(screen.getByText("All Tours")).toBeInTheDocument();
    expect(screen.getAllByText("Island Tours").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Filter Tours").length).toBeGreaterThanOrEqual(1);
  });

  it("renders client-provided tour cards asynchronously from dummy data", async () => {
    render(
      <StoreProvider>
        <ToursPage />
      </StoreProvider>
    );

    expect(
      await screen.findByText("James Bond Islands Tour")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Similan Islands Day Trip")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Phi Phi Islands Tour")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Beach Elephant Bathing Phuket")
    ).toBeInTheDocument();
  });
});
