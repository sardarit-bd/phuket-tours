export type BookingStatus =
  | "draft"
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled";

export interface GuestDetails {
  fullName: string;
  email: string;
  phone: string;
  hotelName?: string;
  specialRequests?: string;
}

export interface BookingGuestsCount {
  adults: number;
  children: number;
  infants: number;
}

export interface BookingDraft {
  tourId: string;
  tourSlug: string;
  tourTitle: string;
  selectedDate: string;
  guests: BookingGuestsCount;
  guestDetails: GuestDetails;
  totalPrice: number;
  currency: string;
}

export interface BookingSubmission extends BookingDraft {
  id?: string;
  bookingReference?: string;
  status: BookingStatus;
  createdAt?: string;
}
