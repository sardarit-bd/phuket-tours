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
  duration?: string;
  groupSize?: string;
  languages?: string[];
  badge?: string;
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

export interface TourFilterParams {
  category?: string;
  search?: string;
  duration?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "featured" | "price-asc" | "price-desc" | "rating";
  page?: number;
  limit?: number;
}
