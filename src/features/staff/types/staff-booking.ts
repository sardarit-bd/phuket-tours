/**
 * Staff Bookings Feature Types
 *
 * Types aligned with:
 * - POST /api/v1/staff/bookings
 * - POST /api/v1/staff/bookings/:bookingId/payment-link
 */

export interface StaffBookingCustomerInput {
  name: string;
  email: string;
  phone?: string | null;
}

export interface CreateStaffBookingInput {
  customerId?: string;
  customer?: StaffBookingCustomerInput;
  serviceId: string;
  travelDate: string;
  adults: number;
  children?: number;
  infants?: number;
  notes?: string;
  discount?: {
    discountType: "PERCENTAGE" | "FIXED_AMOUNT";
    discountValue: number;
    reason: string;
  };
}

export interface StaffBookingResult {
  id: string;
  serviceId: string;
  customerId: string;
  createdById: string | null;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | string;
  paymentStatus: "UNPAID" | "PARTIALLY_PAID" | "PAID" | string;
  finalPrice: number;
  currency: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
  service?: {
    id: string;
    name: string;
    type: string;
  };
  availability?: {
    id: string;
    date: string;
  } | null;
}

export interface GenerateStaffPaymentLinkInput {
  bookingId: string;
  expiresInDays?: number;
}

export interface StaffPaymentLinkResult {
  paymentLinkId: string;
  bookingId: string;
  paymentUrl: string;
  rawToken: string;
  expiresAt: string;
  status: "ACTIVE" | "EXPIRED" | "COMPLETED" | "REVOKED";
}
