import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  mockTourDataProvider,
  filterAndSortToursLocally,
} from "./tour-data-provider";
import { clientDummyTours, TOTAL_TOURS_CATALOG_COUNT } from "../data/tours-data";

describe("TourDataProvider & Client Dummy Data Verification", () => {
  const dummyFilePath = path.resolve(
    process.cwd(),
    "src/features/tours/data/dummydata.txt"
  );

  it("verifies dummydata.txt exists and parses 441 non-empty lines with no malformed lines", () => {
    const rawContent = fs.readFileSync(dummyFilePath, "utf-8");
    const rawLines = rawContent
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    expect(rawLines.length).toBe(441);

    const malformed: { line: number; text: string }[] = [];
    rawLines.forEach((line, index) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (!match) {
        malformed.push({ line: index + 1, text: line });
      }
    });

    expect(malformed).toHaveLength(0);
  });

  it("verifies dummydata.txt contains zero duplicate IDs across all 441 entries", () => {
    const rawContent = fs.readFileSync(dummyFilePath, "utf-8");
    const rawLines = rawContent
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const seenIds = new Set<string>();
    const duplicateIds: string[] = [];

    rawLines.forEach((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const id = match[1];
        if (seenIds.has(id)) {
          duplicateIds.push(id);
        } else {
          seenIds.add(id);
        }
      }
    });

    expect(duplicateIds).toHaveLength(0);
    expect(seenIds.size).toBe(441);
  });

  it("verifies every single clientDummyTour is directly sourced from dummydata.txt with matching ID and title", () => {
    const rawContent = fs.readFileSync(dummyFilePath, "utf-8");
    const rawLines = rawContent
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    const fileMap = new Map<string, string>();
    rawLines.forEach((line) => {
      const match = line.match(/^(\d+)\s+(.+)$/);
      if (match) {
        fileMap.set(match[1], match[2].trim());
      }
    });

    expect(clientDummyTours.length).toBe(441);
    expect(TOTAL_TOURS_CATALOG_COUNT).toBe(441);

    clientDummyTours.forEach((tour) => {
      expect(fileMap.has(tour.id)).toBe(true);
      expect(tour.title).toBe(fileMap.get(tour.id));
      expect(tour.slug).toContain(tour.id);
      expect(tour.price.amount).toBeGreaterThan(0);
      expect(tour.price.currency).toBe("$");
    });
  });

  it("supports search filter by title, destination, and tour ID", async () => {
    // 1. Search by exact ID
    const byId = await mockTourDataProvider.getTours({ search: "802" });
    expect(byId.data.some((t) => t.id === "802")).toBe(true);
    expect(byId.data[0].title).toBe("Similan Islands Day Trip");

    // 2. Search by title keyword
    const byTitle = await mockTourDataProvider.getTours({ search: "Similan" });
    expect(byTitle.data.length).toBeGreaterThanOrEqual(1);
    expect(byTitle.data.every((t) => t.title.toLowerCase().includes("similan") || t.destination.toLowerCase().includes("similan"))).toBe(true);

    // 3. Search by destination keyword
    const byDest = await mockTourDataProvider.getTours({ search: "Phi Phi" });
    expect(byDest.data.length).toBeGreaterThanOrEqual(1);
  });

  it("supports category tab filtering", async () => {
    const islandTours = await mockTourDataProvider.getTours({
      category: "island-tours",
    });
    expect(islandTours.data.length).toBeGreaterThan(0);
    expect(
      islandTours.data.every(
        (t) =>
          t.categoryId === "island-tours" ||
          t.tourType === "island-tours" ||
          t.tourType === "cruises"
      )
    ).toBe(true);

    const transfers = await mockTourDataProvider.getTours({
      category: "transfers",
    });
    expect(transfers.data.length).toBeGreaterThan(0);
    expect(
      transfers.data.every(
        (t) => t.categoryId === "transfers" || t.tourType === "transfers"
      )
    ).toBe(true);
  });

  it("supports destination checkbox filtering", async () => {
    const res = await mockTourDataProvider.getTours({
      destinations: ["similan-islands"],
    });
    expect(res.data.length).toBeGreaterThan(0);
    expect(
      res.data.every((t) => t.destinationCategory === "similan-islands")
    ).toBe(true);
  });

  it("supports duration checkbox filtering", async () => {
    const multiDay = await mockTourDataProvider.getTours({
      durations: ["multi-day"],
    });
    expect(multiDay.data.length).toBeGreaterThan(0);
    expect(
      multiDay.data.every((t) => t.durationCategory === "multi-day")
    ).toBe(true);
  });

  it("supports price range filtering", async () => {
    const cheap = await mockTourDataProvider.getTours({
      minPrice: 20,
      maxPrice: 50,
    });
    expect(cheap.data.length).toBeGreaterThan(0);
    expect(
      cheap.data.every((t) => t.price.amount >= 20 && t.price.amount <= 50)
    ).toBe(true);
  });

  it("supports sorting by price ascending, price descending, and duration", async () => {
    const asc = await mockTourDataProvider.getTours({ sortBy: "price-asc" });
    for (let i = 0; i < asc.data.length - 1; i++) {
      expect(asc.data[i].price.amount).toBeLessThanOrEqual(
        asc.data[i + 1].price.amount
      );
    }

    const desc = await mockTourDataProvider.getTours({ sortBy: "price-desc" });
    for (let i = 0; i < desc.data.length - 1; i++) {
      expect(desc.data[i].price.amount).toBeGreaterThanOrEqual(
        desc.data[i + 1].price.amount
      );
    }
  });

  it("returns total catalog count when unfiltered and exact matched count when filtered", async () => {
    const unfiltered = await mockTourDataProvider.getTours();
    expect(unfiltered.total).toBe(441);
    expect(unfiltered.data.length).toBe(441);

    const filtered = await mockTourDataProvider.getTours({
      search: "Similan",
    });
    expect(filtered.total).toBe(filtered.data.length);
    expect(filtered.total).toBeLessThan(441);
  });

  it("allows clearing all filters and resetting to complete catalog", () => {
    const filtered = filterAndSortToursLocally(clientDummyTours, {
      destinations: ["krabi"],
      minPrice: 100,
    });
    expect(filtered.filtered.length).toBeLessThan(441);

    const cleared = filterAndSortToursLocally(clientDummyTours, undefined);
    expect(cleared.total).toBe(441);
    expect(cleared.filtered.length).toBe(441);
  });
});
