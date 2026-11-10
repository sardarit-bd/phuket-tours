import { Tour } from "../types/tour";

/**
 * Normalizes a text string by:
 * - Lowercasing
 * - Stripping non-alphanumeric punctuation to spaces (e.g. "phi-phi" -> "phi phi")
 * - Normalizing whitespace
 * - Mapping common travel synonyms (e.g., "snorkeling" <-> "snorkelling")
 */
export function normalizeSearchText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Common equivalent spellings or terms in Thailand tour bookings.
 */
const SYNONYM_MAP: Record<string, string> = {
  snorkling: "snorkeling",
  snorkelling: "snorkeling",
  phiphi: "phi phi",
  "phi-phi": "phi phi",
  catameran: "catamaran",
  elefant: "elephant",
  fantase: "fantasea",
  fantasee: "fantasea",
  kano: "canoe",
  canoeing: "canoe",
  canoes: "canoe",
  kayak: "canoe",
  kayaking: "canoe",
  "zip-line": "zipline",
  "zip line": "zipline",
  hanumanworld: "hanuman world",
};

/**
 * Applies domain synonyms to search queries.
 */
export function applySynonyms(normalizedQuery: string): string {
  let result = normalizedQuery;
  for (const [misspelling, canonical] of Object.entries(SYNONYM_MAP)) {
    const regex = new RegExp(`\\b${misspelling}\\b`, "g");
    result = result.replace(regex, canonical);
  }
  return result;
}

/**
 * Calculates Damerau-Levenshtein edit distance for fuzzy typo tolerance.
 * Accounts for insertions, deletions, substitutions, and adjacent transpositions.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const al = a.length;
  const bl = b.length;
  const dp: number[][] = Array.from({ length: al + 1 }, () =>
    new Array(bl + 1).fill(0)
  );

  for (let i = 0; i <= al; i++) dp[i][0] = i;
  for (let j = 0; j <= bl; j++) dp[0][j] = j;

  for (let i = 1; i <= al; i++) {
    for (let j = 1; j <= bl; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost // substitution
      );

      // Transposition
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
      }
    }
  }

  return dp[al][bl];
}

/**
 * Pre-computed searchable index for a tour to avoid repetitive string
 * transformations on every search query.
 */
export interface TourSearchIndex {
  tour: Tour;
  normalizedTitle: string;
  titleWords: string[];
  normalizedDestination: string;
  destWords: string[];
  normalizedDescription: string;
  normalizedCategory: string;
}

export function buildTourSearchIndex(tour: Tour): TourSearchIndex {
  const normalizedTitle = normalizeSearchText(tour.title);
  const normalizedDestination = normalizeSearchText(tour.destination);
  const normalizedDescription = normalizeSearchText(
    `${tour.subtitle || ""} ${tour.description}`
  );
  const normalizedCategory = normalizeSearchText(
    `${tour.categoryName || ""} ${tour.tourType || ""}`
  );

  return {
    tour,
    normalizedTitle,
    titleWords: normalizedTitle.split(" ").filter(Boolean),
    normalizedDestination,
    destWords: normalizedDestination.split(" ").filter(Boolean),
    normalizedDescription,
    normalizedCategory,
  };
}

/**
 * Matches a single query token against candidate words using exact,
 * prefix, or fuzzy edit-distance matching.
 */
function matchTokenAgainstWords(
  token: string,
  words: string[]
): { matched: boolean; isFuzzy: boolean } {
  // 1. Exact token match or prefix match
  for (const word of words) {
    if (word === token || (token.length >= 3 && word.startsWith(token))) {
      return { matched: true, isFuzzy: false };
    }
  }

  // 2. Fuzzy tolerance:
  // - Tokens of length 4 to 6: tolerate 1 edit (e.g. "similn" -> "similan")
  // - Tokens of length 7+: tolerate up to 2 edits (e.g. "catameran" -> "catamaran")
  const maxAllowedDist = token.length >= 7 ? 2 : token.length >= 4 ? 1 : 0;
  if (maxAllowedDist > 0) {
    for (const word of words) {
      if (Math.abs(word.length - token.length) <= maxAllowedDist) {
        if (editDistance(word, token) <= maxAllowedDist) {
          return { matched: true, isFuzzy: true };
        }
      }
    }
  }

  return { matched: false, isFuzzy: false };
}

export interface SearchResultItem {
  tour: Tour;
  score: number;
}

/**
 * Scores and ranks a single indexed tour against a normalized search query.
 * Returns score > 0 if the tour is relevant, higher scores meaning higher relevance.
 */
export function scoreTour(
  index: TourSearchIndex,
  rawQuery: string
): number {
  const cleaned = normalizeSearchText(rawQuery);
  if (!cleaned) return 1;

  const query = applySynonyms(cleaned);
  const tokens = query.split(" ").filter(Boolean);
  if (tokens.length === 0) return 1;

  let score = 0;
  const tour = index.tour;

  // 1. Direct ID match (highest priority, e.g. "802")
  if (tour.id === cleaned || tour.id === rawQuery.trim()) {
    return 300;
  }

  // 2. Exact Title Match
  if (index.normalizedTitle === query) {
    return 250;
  }

  // 3. Title Starts With query phrase
  if (index.normalizedTitle.startsWith(query)) {
    score += 100;
  } else if (index.normalizedTitle.includes(query)) {
    // 4. Title contains the query as an exact contiguous phrase
    score += 80;
  }

  // 5. Individual Token Matching across fields
  let titleTokensMatched = 0;
  let titleFuzzyMatched = 0;
  let destinationMatched = false;
  let categoryMatched = false;
  let descMatched = false;

  for (const token of tokens) {
    const titleMatch = matchTokenAgainstWords(token, index.titleWords);
    if (titleMatch.matched) {
      titleTokensMatched++;
      if (titleMatch.isFuzzy) titleFuzzyMatched++;
      continue;
    }

    const destMatch = matchTokenAgainstWords(token, index.destWords);
    if (destMatch.matched) {
      destinationMatched = true;
      continue;
    }

    if (index.normalizedCategory.includes(token)) {
      categoryMatched = true;
      continue;
    }

    if (index.normalizedDescription.includes(token)) {
      descMatched = true;
    }
  }

  // Score contribution from title tokens
  if (titleTokensMatched === tokens.length) {
    score += 60 - titleFuzzyMatched * 10;
  } else if (titleTokensMatched > 0) {
    score += (35 * titleTokensMatched) / tokens.length - titleFuzzyMatched * 5;
  }

  // Destination match
  if (destinationMatched) {
    score += 30;
  }

  // Category match
  if (categoryMatched) {
    score += 20;
  }

  // Description / Subtitle match
  if (descMatched) {
    score += 15;
  }

  // If at least one primary token matched
  const totalTokensAccountedFor =
    titleTokensMatched +
    (destinationMatched ? 1 : 0) +
    (categoryMatched ? 1 : 0) +
    (descMatched ? 1 : 0);

  if (totalTokensAccountedFor === 0) {
    return 0;
  }

  return Math.max(score, 5);
}

/**
 * Searches and ranks a pre-indexed collection of tours by relevance.
 */
export function searchAndRankTours(
  indices: TourSearchIndex[],
  query: string
): SearchResultItem[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return indices.map((idx) => ({ tour: idx.tour, score: 1 }));
  }

  const results: SearchResultItem[] = [];

  for (const idx of indices) {
    const score = scoreTour(idx, trimmed);
    if (score > 0) {
      results.push({ tour: idx.tour, score });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}
