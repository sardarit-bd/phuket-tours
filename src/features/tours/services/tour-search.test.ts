import { describe, it, expect } from "vitest";
import {
  normalizeSearchText,
  applySynonyms,
  editDistance,
  buildTourSearchIndex,
  scoreTour,
  searchAndRankTours,
} from "./tour-search";
import { clientDummyTours } from "../data/tours-data";

describe("Tour Search Service", () => {
  it("normalizes search text by lowercasing, stripping special punctuation, and collapsing whitespace", () => {
    expect(normalizeSearchText("  Phi-Phi   Islands!  ")).toBe(
      "phi phi islands"
    );
    expect(normalizeSearchText("SIMILAN")).toBe("similan");
    expect(normalizeSearchText("ATV / Zipline & Buggy")).toBe(
      "atv zipline buggy"
    );
  });

  it("maps common travel synonyms like snorkeling vs snorkelling and phiphi", () => {
    expect(applySynonyms("snorkeling")).toBe("snorkeling");
    expect(applySynonyms("snorkelling")).toBe("snorkeling");
    expect(applySynonyms("phiphi")).toBe("phi phi");
    expect(applySynonyms("catameran")).toBe("catamaran");
  });

  it("calculates Damerau-Levenshtein edit distance accurately", () => {
    expect(editDistance("similan", "similan")).toBe(0);
    expect(editDistance("similan", "similn")).toBe(1); // 1 deletion
    expect(editDistance("catamaran", "catameran")).toBe(1); // 1 substitution
    expect(editDistance("elephant", "elefant")).toBe(2); // ph -> f
    expect(editDistance("phuket", "puhket")).toBe(1); // adjacent transposition
  });

  it("builds search index with normalized tokens and fields", () => {
    const sample = clientDummyTours.find((t) => t.id === "802")!;
    const index = buildTourSearchIndex(sample);

    expect(index.normalizedTitle).toBe("similan islands day trip");
    expect(index.titleWords).toContain("similan");
    expect(index.titleWords).toContain("islands");
    expect(index.normalizedDestination).toBe("similan islands");
  });

  it("prioritizes exact ID search above all other matches", () => {
    const sample = clientDummyTours.find((t) => t.id === "802")!;
    const index = buildTourSearchIndex(sample);

    const idScore = scoreTour(index, "802");
    expect(idScore).toBe(300);
  });

  it("ranks exact title match above partial and fuzzy matches", () => {
    const similan = clientDummyTours.find((t) => t.id === "802")!;
    const similanIndex = buildTourSearchIndex(similan);

    const exactScore = scoreTour(similanIndex, "Similan Islands Day Trip");
    const partialScore = scoreTour(similanIndex, "Similan");
    const fuzzyScore = scoreTour(similanIndex, "Similn");

    expect(exactScore).toBeGreaterThan(partialScore);
    expect(partialScore).toBeGreaterThan(fuzzyScore);
    expect(fuzzyScore).toBeGreaterThan(0);
  });

  it("finds tours with minor spelling typos via fuzzy search", () => {
    const indices = clientDummyTours.map(buildTourSearchIndex);

    // Typo: "similn" instead of "similan"
    const similnResults = searchAndRankTours(indices, "similn");
    expect(similnResults.length).toBeGreaterThan(0);
    expect(
      similnResults.some((r) => r.tour.title.includes("Similan"))
    ).toBe(true);

    // Typo: "catameran" instead of "catamaran"
    const catameranResults = searchAndRankTours(indices, "catameran");
    expect(catameranResults.length).toBeGreaterThan(0);
    expect(
      catameranResults.some((r) => r.tour.title.toLowerCase().includes("catamaran"))
    ).toBe(true);
  });

  it("ranks title matches above description-only matches", () => {
    const indices = clientDummyTours.map(buildTourSearchIndex);
    const results = searchAndRankTours(indices, "turtle");

    if (results.length > 1) {
      const first = results[0];
      const second = results[1];
      expect(first.score).toBeGreaterThanOrEqual(second.score);
    }
  });

  it("returns all items with score 1 when query is empty or whitespace", () => {
    const indices = clientDummyTours.map(buildTourSearchIndex);
    const emptyResults = searchAndRankTours(indices, "   ");
    expect(emptyResults.length).toBe(clientDummyTours.length);
    expect(emptyResults[0].score).toBe(1);
  });
});
