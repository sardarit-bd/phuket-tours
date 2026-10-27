export interface TourPrice {
  amount: number;
  currency: string;
  originalAmount?: number;
  discountPercentage?: number;
  perPersonLabel?: string;
}

export interface TourAvailability {
  dates?: string[];
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday...
  isDaily?: boolean;
  nextAvailableDate?: string;
}

export interface TourLocation {
  city: string;
  country: string;
  departurePoint?: string;
}

export interface TourReviewSummary {
  rating: number; // e.g., 4.9
  reviewCount: number;
}

export interface TourItineraryItem {
  time?: string;
  title: string;
  description: string;
}

export type TourBadgeType = "Popular" | "Bestseller" | "New";
export type TourBadgeVariant = "popular" | "bestseller" | "new";

export interface Tour {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  images: string[];
  featuredImage?: string;
  duration: string; // e.g., "Full Day", "Half Day", "Evening"
  durationCategory: "half-day" | "full-day" | "multi-day";
  destination: string; // e.g., "Phi Phi Islands", "Similan Islands", "Phuket"
  destinationCategory: string; // e.g., "phuket", "phi-phi-islands", "similan-islands", "james-bond-island", "krabi"
  tourType: string; // e.g., "island-tours", "adventure", "water-activities", "cultural-sightseeing", "shows-entertainment"
  groupSize?: string;
  languages?: string[];
  badge?: TourBadgeType;
  badgeVariant?: TourBadgeVariant;
  isFeatured?: boolean;
  price: TourPrice;
  availability?: TourAvailability;
  location?: TourLocation;
  reviews?: TourReviewSummary;
  highlights?: string[];
  itinerary?: TourItineraryItem[];
  included?: string[];
  excluded?: string[];
}

export type TourSortOption =
  | "most-popular"
  | "price-asc"
  | "price-desc"
  | "highest-rated"
  | "duration";

export interface TourFilterState {
  search: string;
  category: string;
  destinations: string[];
  tourTypes: string[];
  durations: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: TourSortOption;
  page: number;
  limit: number;
}

export interface TourCategory {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export interface FilterOption {
  id: string;
  label: string;
  count: number;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
}

export interface TourFilterParams {
  category?: string;
  search?: string;
  destinations?: string[];
  tourTypes?: string[];
  durations?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: TourSortOption;
  page?: number;
  limit?: number;
}

export interface ToursResponse {
  data: Tour[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
