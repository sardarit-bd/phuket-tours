import { describe, it, expect } from "vitest";
import { getTagsForEvent } from "../use-dashboard-events";
import type { DashboardEvent } from "../dashboard-event-client";

describe("getTagsForEvent", () => {
  it("maps booking.created to booking list and summary tags", () => {
    const event: DashboardEvent = {
      id: "1",
      type: "booking.created",
      entityId: "b-100",
      timestamp: new Date().toISOString(),
    };

    const tags = getTagsForEvent(event);
    expect(tags).toContainEqual({ type: "Booking", id: "LIST" });
    expect(tags).toContainEqual({ type: "Booking", id: "STAFF_LIST" });
    expect(tags).toContain("AdminReport");
    expect(tags).toContain("AgentOverview");
    expect(tags).toContain("AgentBookings");
    expect(tags).toContain("CustomerBookings");
  });

  it("maps booking.approved to specific booking id and list tags", () => {
    const event: DashboardEvent = {
      id: "2",
      type: "booking.approved",
      entityId: "b-200",
      timestamp: new Date().toISOString(),
    };

    const tags = getTagsForEvent(event);
    expect(tags).toContainEqual({ type: "Booking", id: "b-200" });
    expect(tags).toContainEqual({ type: "Booking", id: "LIST" });
    expect(tags).toContain("AdminReport");
  });

  it("maps payment.verified to payment, booking and commissions tags", () => {
    const event: DashboardEvent = {
      id: "3",
      type: "payment.verified",
      entityId: "pay-1",
      timestamp: new Date().toISOString(),
      metadata: { bookingId: "b-300" },
    };

    const tags = getTagsForEvent(event);
    expect(tags).toContainEqual({ type: "Booking", id: "b-300" });
    expect(tags).toContain("AdminPayment");
    expect(tags).toContain("AdminReport");
    expect(tags).toContain("AgentCommissions");
  });
});
