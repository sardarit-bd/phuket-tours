import {
  Tour,
  TourCategory,
  FilterGroup,
  TourSortOption,
} from "../types/tour";
import { clientDummyTours } from "./client-tours-data";

export { clientDummyTours };
export const mockTours: Tour[] = clientDummyTours;
export const TOTAL_TOURS_CATALOG_COUNT = clientDummyTours.length;

export const tourCategories: TourCategory[] = [
  { id: "all", name: "All Tours", icon: "grid" },
  // { id: "island-tours", name: "Island Tours", icon: "island" },
  // { id: "snorkeling-diving", name: "Snorkeling & Diving", icon: "diving" },
  // { id: "adventure", name: "Adventure", icon: "adventure" },
  // { id: "shows-entertainment", name: "Shows & Entertainment", icon: "shows" },
  // { id: "cultural", name: "Cultural", icon: "cultural" },
  // { id: "transfers", name: "Transfers", icon: "transfers" },
];

function computeFilterCounts(tours: Tour[]) {
  const destCounts: Record<string, number> = {};
  const typeCounts: Record<string, number> = {};
  const durCounts: Record<string, number> = {};

  tours.forEach((tour) => {
    destCounts[tour.destinationCategory] =
      (destCounts[tour.destinationCategory] || 0) + 1;
    typeCounts[tour.tourType] = (typeCounts[tour.tourType] || 0) + 1;
    durCounts[tour.durationCategory] =
      (durCounts[tour.durationCategory] || 0) + 1;
  });

  return { destCounts, typeCounts, durCounts };
}

const { destCounts, typeCounts, durCounts } = computeFilterCounts(clientDummyTours);

export const filterGroups: FilterGroup[] = [
  {
    id: "destination",
    title: "Destination",
    options: [
      { id: "phuket", label: "Phuket", count: destCounts["phuket"] || 0 },
      {
        id: "phi-phi-islands",
        label: "Phi Phi Islands",
        count: destCounts["phi-phi-islands"] || 0,
      },
      {
        id: "similan-islands",
        label: "Similan Islands",
        count: destCounts["similan-islands"] || 0,
      },
      {
        id: "james-bond-island",
        label: "James Bond Island",
        count: destCounts["james-bond-island"] || 0,
      },
      { id: "krabi", label: "Krabi", count: destCounts["krabi"] || 0 },
      {
        id: "racha-island",
        label: "Racha Island",
        count: destCounts["racha-island"] || 0,
      },
      {
        id: "phang-nga-bay",
        label: "Phang Nga Bay",
        count: destCounts["phang-nga-bay"] || 0,
      },
      {
        id: "coral-island",
        label: "Coral Island",
        count: destCounts["coral-island"] || 0,
      },
    ],
  },
  {
    id: "tour-type",
    title: "Tour Type",
    options: [
      {
        id: "island-tours",
        label: "Island Tours",
        count: typeCounts["island-tours"] || 0,
      },
      {
        id: "adventure",
        label: "Adventure",
        count: typeCounts["adventure"] || 0,
      },
      {
        id: "water-activities",
        label: "Water Activities",
        count: typeCounts["water-activities"] || 0,
      },
      {
        id: "cultural-sightseeing",
        label: "Cultural & Sightseeing",
        count: typeCounts["cultural-sightseeing"] || 0,
      },
      {
        id: "shows-entertainment",
        label: "Shows & Entertainment",
        count: typeCounts["shows-entertainment"] || 0,
      },
      {
        id: "cruises",
        label: "Sunset & Dinner Cruises",
        count: typeCounts["cruises"] || 0,
      },
      {
        id: "transfers",
        label: "Speedboat & Ferry Transfers",
        count: typeCounts["transfers"] || 0,
      },
    ],
  },
  {
    id: "duration",
    title: "Duration",
    options: [
      {
        id: "half-day",
        label: "Half Day (1–4 hours)",
        count: durCounts["half-day"] || 0,
      },
      {
        id: "full-day",
        label: "Full Day (6–10 hours)",
        count: durCounts["full-day"] || 0,
      },
      {
        id: "multi-day",
        label: "Multi-day",
        count: durCounts["multi-day"] || 0,
      },
    ],
  },
];

export const sortOptions: { value: TourSortOption; label: string }[] = [
  { value: "most-popular", label: "Most Popular" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "highest-rated", label: "Highest Rated" },
  { value: "duration", label: "Duration" },
];
