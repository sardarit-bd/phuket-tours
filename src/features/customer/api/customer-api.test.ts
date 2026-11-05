import { describe, it, expect } from "vitest";
import {
  useGetCustomerBookingsQuery,
  useGetCustomerBookingByIdQuery,
  useGetCustomerPaymentsQuery,
  useGetCustomerPaymentByIdQuery,
  useUpdateProfileMutation,
  customerApi,
} from "./customer-api";

describe("customerApi", () => {
  it("registers all customer endpoints", () => {
    expect(customerApi.endpoints.getCustomerBookings).toBeDefined();
    expect(customerApi.endpoints.getCustomerBookingById).toBeDefined();
    expect(customerApi.endpoints.getCustomerPayments).toBeDefined();
    expect(customerApi.endpoints.getCustomerPaymentById).toBeDefined();
    expect(customerApi.endpoints.updateProfile).toBeDefined();
  });

  it("exports the expected hooks", () => {
    expect(useGetCustomerBookingsQuery).toBeTypeOf("function");
    expect(useGetCustomerBookingByIdQuery).toBeTypeOf("function");
    expect(useGetCustomerPaymentsQuery).toBeTypeOf("function");
    expect(useGetCustomerPaymentByIdQuery).toBeTypeOf("function");
    expect(useUpdateProfileMutation).toBeTypeOf("function");
  });

  it("customerApi is a valid API instance", () => {
    expect(customerApi.util).toBeDefined();
  });
});
