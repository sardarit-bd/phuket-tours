import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  adminApi,
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetAdminPaymentsReportQuery,
  useGetAdminServicesReportQuery,
  useGetAdminUsersQuery,
  useGetAdminUserByIdQuery,
  useGetAdminAgentByIdQuery,
  useCreateAdminAgentMutation,
  useCreateAdminStaffMutation,
  useUpdateAdminUserMutation,
  useUpdateAdminAgentMutation,
  useGetAdminCommissionsQuery,
  useGetAdminCommissionByIdQuery,
  useAdjustAdminCommissionMutation,
  useGetAdminCommissionRulesQuery,
  useConfigureAdminCommissionRuleMutation,
  useGetAdminCommissionsReportQuery,
  type AdminApiResponse,
  type AdminRevenueReportData,
  type AdminBookingsReportData,
  type AdminPaymentsReportData,
  type AdminServicesReportData,
} from "./admin-api";
import { makeStore } from "@/store";

describe("adminApi RTK Query endpoints", () => {
  const originalFetch = globalThis.fetch;
  let capturedRequest: {
    url: string;
    method: string;
    credentials?: RequestCredentials;
    body?: string;
  } | null = null;

  const setupMockFetch = (status: number, responseBody: unknown) => {
    globalThis.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      let url = "";
      let method = "GET";
      let credentials: RequestCredentials | undefined;
      let body = "";

      if (input instanceof Request) {
        url = input.url;
        method = input.method;
        credentials = input.credentials;
        body = await input.clone().text();
      } else {
        url = String(input);
        method = init?.method || "GET";
        credentials = init?.credentials;
        body = init?.body ? String(init.body) : "";
      }

      capturedRequest = { url, method, credentials, body };

      return {
        ok: status >= 200 && status < 300,
        status,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => responseBody,
        text: async () => JSON.stringify(responseBody),
        clone() {
          return this;
        },
      } as unknown as Response;
    });
  };

  beforeEach(() => {
    capturedRequest = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("exports all generated query hooks for admin analytics and user management", () => {
    expect(typeof useGetAdminRevenueReportQuery).toBe("function");
    expect(typeof useGetAdminBookingsReportQuery).toBe("function");
    expect(typeof useGetAdminPaymentsReportQuery).toBe("function");
    expect(typeof useGetAdminServicesReportQuery).toBe("function");
    expect(typeof useGetAdminUsersQuery).toBe("function");
    expect(typeof useGetAdminUserByIdQuery).toBe("function");
    expect(typeof useGetAdminAgentByIdQuery).toBe("function");
    expect(typeof useCreateAdminAgentMutation).toBe("function");
    expect(typeof useCreateAdminStaffMutation).toBe("function");
    expect(typeof useUpdateAdminUserMutation).toBe("function");
    expect(typeof useUpdateAdminAgentMutation).toBe("function");
    expect(typeof useGetAdminCommissionsQuery).toBe("function");
    expect(typeof useGetAdminCommissionByIdQuery).toBe("function");
    expect(typeof useAdjustAdminCommissionMutation).toBe("function");
    expect(typeof useGetAdminCommissionRulesQuery).toBe("function");
    expect(typeof useConfigureAdminCommissionRuleMutation).toBe("function");
    expect(typeof useGetAdminCommissionsReportQuery).toBe("function");
  });

  describe("GET /admin/reports/revenue", () => {
    it("fetches revenue metrics with credentials: 'include'", async () => {
      const mockResponse: AdminApiResponse<AdminRevenueReportData> = {
        success: true,
        message: "Revenue report retrieved successfully",
        data: {
          filters: {
            from: "2026-01-01T00:00:00.000Z",
            to: "2026-01-31T23:59:59.999Z",
            serviceType: null,
            agentId: null,
          },
          bookedValue: 125000.5,
          revenue: 95400.0,
          collectedPayments: 92000.0,
          outstandingBalance: 33400.5,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminRevenueReport.initiate({
          from: "2026-01-01",
          to: "2026-01-31",
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toContain("http://localhost:5000/api/v1/admin/reports/revenue");
      expect(capturedRequest?.url).toContain("from=2026-01-01");
      expect(capturedRequest?.url).toContain("to=2026-01-31");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.success).toBe(true);
        expect(result.data.data.revenue).toBe(95400.0);
        expect(result.data.data.bookedValue).toBe(125000.5);
        expect(result.data.data.collectedPayments).toBe(92000.0);
        expect(result.data.data.outstandingBalance).toBe(33400.5);
      }
    });

    it("handles 401 unauthenticated error safely", async () => {
      const mockError = {
        success: false,
        message: "Unauthorized",
        data: null,
      };

      setupMockFetch(401, mockError);
      const store = makeStore();

      const result = await store.dispatch(adminApi.endpoints.getAdminRevenueReport.initiate());

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect((result.error as { status: number }).status).toBe(401);
      }
    });
  });

  describe("GET /admin/reports/bookings", () => {
    it("fetches booking status breakdown correctly", async () => {
      const mockResponse: AdminApiResponse<AdminBookingsReportData> = {
        success: true,
        message: "Bookings report retrieved successfully",
        data: {
          filters: {
            from: null,
            to: null,
            serviceType: null,
            agentId: null,
            status: null,
          },
          totalBookings: 42,
          byStatus: [
            { status: "COMPLETED", count: 20, totalValue: 60000 },
            { status: "CONFIRMED", count: 12, totalValue: 36000 },
            { status: "PENDING", count: 6, totalValue: 18000 },
            { status: "CANCELLED", count: 4, totalValue: 12000 },
          ],
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(adminApi.endpoints.getAdminBookingsReport.initiate());

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/reports/bookings");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.totalBookings).toBe(42);
        expect(result.data.data.byStatus).toHaveLength(4);
        expect(result.data.data.byStatus[0].status).toBe("COMPLETED");
      }
    });

    it("handles 400 validation error on invalid date query", async () => {
      const mockError = {
        success: false,
        message: "The from date must not be after the to date",
        data: null,
      };

      setupMockFetch(400, mockError);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminBookingsReport.initiate({
          from: "2026-12-31",
          to: "2026-01-01",
        })
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect((result.error as { status: number }).status).toBe(400);
      }
    });
  });

  describe("GET /admin/reports/payments", () => {
    it("fetches payment status and reconciliation breakdown", async () => {
      const mockResponse: AdminApiResponse<AdminPaymentsReportData> = {
        success: true,
        message: "Payments report retrieved successfully",
        data: {
          filters: {
            from: null,
            to: null,
            serviceType: null,
            agentId: null,
          },
          byStatus: [
            { status: "VERIFIED", count: 25, totalAmount: 75000 },
            { status: "SUBMITTED", count: 3, totalAmount: 9000 },
          ],
          verifiedByMethod: [
            { method: "BANK_TRANSFER", count: 20, totalAmount: 60000 },
            { method: "CASH", count: 5, totalAmount: 15000 },
          ],
          reconciliation: {
            paidBookingsValue: 75000,
            verifiedPaymentsValue: 75000,
            difference: 0,
            pendingVerificationCount: 3,
            pendingVerificationValue: 9000,
          },
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(adminApi.endpoints.getAdminPaymentsReport.initiate());

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/reports/payments");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.reconciliation.difference).toBe(0);
        expect(result.data.data.reconciliation.pendingVerificationCount).toBe(3);
      }
    });
  });

  describe("GET /admin/reports/services", () => {
    it("fetches service performance with pagination and query parameters", async () => {
      const mockResponse: AdminApiResponse<AdminServicesReportData> = {
        success: true,
        message: "Services report retrieved successfully",
        data: {
          filters: {
            from: null,
            to: null,
            serviceType: null,
            agentId: null,
            status: null,
          },
          items: [
            {
              serviceId: "s-1",
              name: "Phi Phi Island Luxury Catamaran Tour",
              type: "TOUR",
              totalBookings: 18,
              completedBookings: 15,
              bookedValue: 54000,
              revenue: 45000,
            },
          ],
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminServicesReport.initiate({ page: 1, limit: 10 })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toContain("http://localhost:5000/api/v1/admin/reports/services");
      expect(capturedRequest?.url).toContain("page=1");
      expect(capturedRequest?.url).toContain("limit=10");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.items).toHaveLength(1);
        expect(result.data.data.items[0].name).toBe("Phi Phi Island Luxury Catamaran Tour");
        expect(result.data.data.total).toBe(1);
      }
    });

    it("handles 500 server error safely", async () => {
      setupMockFetch(500, { success: false, message: "Internal Server Error", data: null });
      const store = makeStore();

      const result = await store.dispatch(adminApi.endpoints.getAdminServicesReport.initiate());

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect((result.error as { status: number }).status).toBe(500);
      }
    });
  });

  describe("GET /admin/services", () => {
    it("constructs correct query parameters for tours search, status, sort, and pagination", async () => {
      const mockResponse = {
        success: true,
        message: "Services retrieved successfully",
        data: {
          items: [
            {
              id: "t-1",
              name: "James Bond Island Day Tour",
              description: "Scenic boat tour",
              type: "TOUR",
              status: "PUBLISHED",
              providerName: "Andaman Marine",
              providerId: "p-1",
              metadata: { destination: "Phang Nga Bay" },
              createdAt: "2026-01-10T10:00:00.000Z",
              updatedAt: "2026-01-15T10:00:00.000Z",
              pricingSummary: {
                currency: "THB",
                basePrice: 2800,
                discountedPrice: 2400,
                taxRate: 7,
                validFrom: null,
                validTo: null,
              },
              availabilitySummary: {
                availableDateCount: 14,
                unavailableDateCount: 2,
                totalCapacity: 40,
                bookedCount: 26,
              },
            },
          ],
          pagination: {
            page: 1,
            limit: 25,
            total: 1,
            totalPages: 1,
          },
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminServices.initiate({
          type: "TOUR",
          search: "james bond",
          status: "PUBLISHED",
          sortBy: "relevance",
          sortOrder: "desc",
          page: 1,
          limit: 25,
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toContain("http://localhost:5000/api/v1/admin/services");
      expect(capturedRequest?.url).toContain("type=TOUR");
      expect(capturedRequest?.url).toContain("search=james+bond");
      expect(capturedRequest?.url).toContain("status=PUBLISHED");
      expect(capturedRequest?.url).toContain("sortBy=relevance");
      expect(capturedRequest?.url).toContain("sortOrder=desc");
      expect(capturedRequest?.url).toContain("page=1");
      expect(capturedRequest?.url).toContain("limit=25");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.items).toHaveLength(1);
        expect(result.data.data.items[0].name).toBe("James Bond Island Day Tour");
        expect(result.data.data.items[0].pricingSummary?.basePrice).toBe(2800);
        expect(result.data.data.items[0].availabilitySummary?.availableDateCount).toBe(14);
      }
    });
  });

  describe("PATCH /admin/services/:serviceId/status", () => {
    it("sends status update with correct URL and body", async () => {
      const mockResponse = {
        success: true,
        message: "Status updated successfully",
        data: {
          id: "t-1",
          name: "James Bond Island Day Tour",
          status: "UNPUBLISHED",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.updateAdminServiceStatus.initiate({
          serviceId: "t-1",
          status: "UNPUBLISHED",
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/t-1/status");
      expect(capturedRequest?.method).toBe("PATCH");
      expect(capturedRequest?.credentials).toBe("include");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        status: "UNPUBLISHED",
      });

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.status).toBe("UNPUBLISHED");
      }
    });
  });

  describe("PATCH /admin/services/bulk-status", () => {
    it("sends bulk status update request with service IDs and target status", async () => {
      const mockResponse = {
        success: true,
        message: "Services status updated successfully",
        data: {
          updatedCount: 2,
          requestedCount: 2,
          updatedIds: ["uuid-1", "uuid-2"],
          notFoundIds: [],
          status: "PUBLISHED",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.bulkUpdateAdminServiceStatus.initiate({
          serviceIds: ["uuid-1", "uuid-2"],
          status: "PUBLISHED",
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/bulk-status");
      expect(capturedRequest?.method).toBe("PATCH");
      expect(capturedRequest?.credentials).toBe("include");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        serviceIds: ["uuid-1", "uuid-2"],
        status: "PUBLISHED",
      });

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data.data.updatedCount).toBe(2);
        expect(result.data.data.notFoundIds).toEqual([]);
        expect(result.data.data.status).toBe("PUBLISHED");
      }
    });
  });

  describe("POST /admin/services (createAdminService)", () => {
    it("sends service creation payload with type TOUR and metadata", async () => {
      const mockResponse = {
        success: true,
        message: "Service created successfully",
        data: {
          id: "tour-created-1",
          name: "Phi Phi Speedboat",
          type: "TOUR",
          status: "DRAFT",
          metadata: { destination: "Phi Phi Islands", duration: "Full Day" },
        },
      };

      setupMockFetch(201, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.createAdminService.initiate({
          name: "Phi Phi Speedboat",
          type: "TOUR",
          description: "Full day island tour",
          metadata: { destination: "Phi Phi Islands", duration: "Full Day" },
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services");
      expect(capturedRequest?.method).toBe("POST");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        name: "Phi Phi Speedboat",
        type: "TOUR",
        description: "Full day island tour",
        metadata: { destination: "Phi Phi Islands", duration: "Full Day" },
      });

      expect("data" in result).toBe(true);
    });
  });

  describe("GET /admin/services/:serviceId (getAdminServiceById)", () => {
    it("fetches service details including pricing and availability", async () => {
      const mockResponse = {
        success: true,
        message: "Admin service details retrieved successfully",
        data: {
          id: "tour-101",
          name: "James Bond Island",
          type: "TOUR",
          status: "PUBLISHED",
          pricing: [{ id: "p-1", basePrice: 120, currency: "USD" }],
          availability: [{ id: "av-1", date: "2026-12-25", isAvailable: true }],
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminServiceById.initiate("tour-101")
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/tour-101");
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });
  });

  describe("PATCH /admin/services/:serviceId (updateAdminService)", () => {
    it("sends partial update for tour name and metadata", async () => {
      const mockResponse = {
        success: true,
        message: "Service updated successfully",
        data: { id: "tour-101", name: "Updated Name" },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.updateAdminService.initiate({
          serviceId: "tour-101",
          name: "Updated Name",
          metadata: { highlights: ["Snorkeling", "Canoeing"] },
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/tour-101");
      expect(capturedRequest?.method).toBe("PATCH");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        name: "Updated Name",
        metadata: { highlights: ["Snorkeling", "Canoeing"] },
      });
      expect("data" in result).toBe(true);
    });
  });

  describe("PUT /admin/services/:serviceId/pricing & availability", () => {
    it("updates pricing configuration", async () => {
      const mockResponse = {
        success: true,
        message: "Pricing updated successfully",
        data: { id: "p-1", basePrice: 150, currency: "USD" },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.updateAdminServicePricing.initiate({
          serviceId: "tour-101",
          currency: "USD",
          basePrice: 150,
          discountedPrice: 120,
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/tour-101/pricing");
      expect(capturedRequest?.method).toBe("PUT");
      expect("data" in result).toBe(true);
    });

    it("updates availability schedule for a date", async () => {
      const mockResponse = {
        success: true,
        message: "Availability updated successfully",
        data: { id: "av-1", date: "2026-12-25", isAvailable: true, capacity: 25 },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.updateAdminServiceAvailability.initiate({
          serviceId: "tour-101",
          date: "2026-12-25",
          isAvailable: true,
          capacity: 25,
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/services/tour-101/availability");
      expect(capturedRequest?.method).toBe("PUT");
      expect("data" in result).toBe(true);
    });
  });

  describe("Operational Bookings & Staff Management Endpoints", () => {
    it("fetches operational bookings with pagination and filters", async () => {
      const mockResponse = {
        success: true,
        message: "Operational bookings retrieved successfully",
        data: {
          items: [],
          page: 2,
          limit: 25,
          total: 50,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminOperationsBookings.initiate({
          page: 2,
          limit: 25,
          fulfillmentStatus: "IN_PROGRESS",
          assignedStaffId: "00000000-0000-0000-0000-000000000001",
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/operations/bookings?page=2&limit=25&fulfillmentStatus=IN_PROGRESS&assignedStaffId=00000000-0000-0000-0000-000000000001"
      );
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });

    it("fetches staff accounts for operational assignments", async () => {
      const mockResponse = {
        success: true,
        message: "Staff retrieved successfully",
        data: {
          items: [
            {
              id: "staff-1",
              name: "Staff Member",
              email: "staff@example.com",
              role: "staff",
              status: "active",
            },
          ],
          pagination: { page: 1, limit: 100, total: 1, totalPages: 1 },
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminStaff.initiate()
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/staff");
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });

    it("assigns staff member to operational booking", async () => {
      const mockResponse = {
        success: true,
        message: "Booking assignment updated successfully",
        data: { id: "bkg-101", assignedStaffId: "staff-1" },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.assignBookingStaff.initiate({
          bookingId: "bkg-101",
          staffId: "staff-1",
          notes: "Handover at pier",
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/operations/bookings/bkg-101/assignment"
      );
      expect(capturedRequest?.method).toBe("PATCH");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        staffId: "staff-1",
        notes: "Handover at pier",
      });
      expect("data" in result).toBe(true);
    });

    it("unassigns staff when staffId is null", async () => {
      const mockResponse = {
        success: true,
        message: "Booking assignment updated successfully",
        data: { id: "bkg-101", assignedStaffId: null },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.assignBookingStaff.initiate({
          bookingId: "bkg-101",
          staffId: null,
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/operations/bookings/bkg-101/assignment"
      );
      expect(capturedRequest?.method).toBe("PATCH");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        staffId: null,
      });
      expect("data" in result).toBe(true);
    });

    it("updates booking fulfillment status with required notes", async () => {
      const mockResponse = {
        success: true,
        message: "Fulfillment status updated successfully",
        data: { id: "bkg-101", fulfillmentStatus: "IN_PROGRESS" },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.updateBookingFulfillmentStatus.initiate({
          bookingId: "bkg-101",
          fulfillmentStatus: "IN_PROGRESS",
          notes: "Guests boarded speedboat",
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/operations/bookings/bkg-101/status"
      );
      expect(capturedRequest?.method).toBe("PATCH");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        fulfillmentStatus: "IN_PROGRESS",
        notes: "Guests boarded speedboat",
      });
      expect("data" in result).toBe(true);
    });

    it("reviews booking price approval proposal", async () => {
      const mockResponse = {
        success: true,
        message: "Price proposal reviewed successfully",
        data: { id: "bkg-101", status: "CONFIRMED", finalPrice: 2500 },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.reviewBookingPriceApproval.initiate({
          bookingId: "bkg-101",
          status: "APPROVED",
          approvedPrice: 2500,
          notes: "Approved special group discount",
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/bookings/bkg-101/price-approvals"
      );
      expect(capturedRequest?.method).toBe("POST");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        status: "APPROVED",
        approvedPrice: 2500,
        notes: "Approved special group discount",
      });
      expect("data" in result).toBe(true);
    });
  });

  describe("User Management Endpoints", () => {
    describe("GET /admin/users", () => {
      it("fetches paginated users list with search and filters", async () => {
        const mockResponse = {
          success: true,
          message: "Users retrieved successfully",
          data: {
            items: [
              {
                id: "usr-1",
                name: "Somchai Staff",
                email: "somchai@qbictravel.com",
                phone: "+66 81 234 5678",
                role: "staff",
                status: "active",
                createdAt: "2026-10-15T08:00:00.000Z",
                updatedAt: "2026-10-15T08:00:00.000Z",
                agentProfile: null,
              },
            ],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getAdminUsers.initiate({
            page: 1,
            limit: 10,
            search: "Somchai",
            role: "staff",
            status: "active",
          })
        );

        expect(capturedRequest?.url).toContain("/admin/users?");
        expect(capturedRequest?.url).toContain("page=1");
        expect(capturedRequest?.url).toContain("limit=10");
        expect(capturedRequest?.url).toContain("search=Somchai");
        expect(capturedRequest?.url).toContain("role=staff");
        expect(capturedRequest?.url).toContain("status=active");
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
      });
    });

    describe("GET /admin/users/:userId", () => {
      it("retrieves single user details by ID", async () => {
        const mockResponse = {
          success: true,
          message: "User retrieved successfully",
          data: {
            id: "usr-1",
            name: "Somchai Staff",
            email: "somchai@qbictravel.com",
            phone: "+66 81 234 5678",
            role: "staff",
            status: "active",
            createdAt: "2026-10-15T08:00:00.000Z",
            updatedAt: "2026-10-15T08:00:00.000Z",
            agentProfile: null,
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getAdminUserById.initiate("usr-1")
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/users/usr-1"
        );
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
      });
    });

    describe("GET /admin/agents/:agentId", () => {
      it("retrieves agent details including agentProfile", async () => {
        const mockResponse = {
          success: true,
          message: "Agent retrieved successfully",
          data: {
            id: "agt-1",
            name: "Agent Smith",
            email: "agent@travel.com",
            phone: "+66 82 999 8888",
            role: "agent",
            status: "active",
            createdAt: "2026-10-10T00:00:00.000Z",
            updatedAt: "2026-10-10T00:00:00.000Z",
            agentProfile: { agencyName: "Andaman Travel Co." },
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getAdminAgentById.initiate("agt-1")
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/agents/agt-1"
        );
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
      });
    });

    describe("POST /admin/agents", () => {
      it("creates an agent and dispatches onboarding invitation", async () => {
        const mockResponse = {
          success: true,
          message: "Agent created successfully",
          data: {
            id: "agt-2",
            name: "Robert Agent",
            email: "robert@agent.com",
            phone: "+66 89 000 1111",
            role: "agent",
            status: "active",
            createdAt: "2026-11-01T00:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
            agentProfile: { agencyName: "Global Tours" },
          },
        };

        setupMockFetch(201, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.createAdminAgent.initiate({
            name: "Robert Agent",
            email: "robert@agent.com",
            phone: "+66 89 000 1111",
            agencyName: "Global Tours",
          })
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/agents"
        );
        expect(capturedRequest?.method).toBe("POST");
        expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
          name: "Robert Agent",
          email: "robert@agent.com",
          phone: "+66 89 000 1111",
          agencyName: "Global Tours",
        });
        expect("data" in result).toBe(true);
      });
    });

    describe("POST /admin/staff", () => {
      it("creates a staff member and dispatches onboarding invitation", async () => {
        const mockResponse = {
          success: true,
          message: "Staff account created successfully",
          data: {
            id: "stf-2",
            name: "Niran Staff",
            email: "niran@phukettours.com",
            phone: "+66 88 555 4433",
            role: "staff",
            status: "active",
            createdAt: "2026-11-01T00:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
            agentProfile: null,
          },
        };

        setupMockFetch(201, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.createAdminStaff.initiate({
            name: "Niran Staff",
            email: "niran@phukettours.com",
            phone: "+66 88 555 4433",
          })
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/staff"
        );
        expect(capturedRequest?.method).toBe("POST");
        expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
          name: "Niran Staff",
          email: "niran@phukettours.com",
          phone: "+66 88 555 4433",
        });
        expect("data" in result).toBe(true);
      });
    });

    describe("PATCH /admin/users/:userId", () => {
      it("updates user name, phone, and status", async () => {
        const mockResponse = {
          success: true,
          message: "User updated successfully",
          data: {
            id: "usr-1",
            name: "Updated Name",
            email: "somchai@qbictravel.com",
            phone: "+66 81 999 0000",
            role: "staff",
            status: "deactivated",
            createdAt: "2026-10-15T08:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
            agentProfile: null,
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.updateAdminUser.initiate({
            userId: "usr-1",
            name: "Updated Name",
            phone: "+66 81 999 0000",
            status: "deactivated",
          })
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/users/usr-1"
        );
        expect(capturedRequest?.method).toBe("PATCH");
        expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
          name: "Updated Name",
          phone: "+66 81 999 0000",
          status: "deactivated",
        });
        expect("data" in result).toBe(true);
      });
    });

    describe("PATCH /admin/agents/:agentId", () => {
      it("updates agent agencyName", async () => {
        const mockResponse = {
          success: true,
          message: "Agent updated successfully",
          data: {
            id: "agt-1",
            name: "Agent Smith",
            email: "agent@travel.com",
            phone: null,
            role: "agent",
            status: "active",
            createdAt: "2026-10-10T00:00:00.000Z",
            updatedAt: "2026-11-01T00:00:00.000Z",
            agentProfile: { agencyName: "Updated Island Tours" },
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.updateAdminAgent.initiate({
            agentId: "agt-1",
            agencyName: "Updated Island Tours",
          })
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/agents/agt-1"
        );
        expect(capturedRequest?.method).toBe("PATCH");
        expect("data" in result).toBe(true);
      });
    });

    describe("Staff Permission Endpoints", () => {
      it("GET /admin/permissions fetches permissions catalog", async () => {
        const mockResponse = {
          success: true,
          message: "Permission catalog retrieved successfully",
          data: {
            totalPermissions: 20,
            modules: [
              {
                module: "tours",
                permissions: [
                  {
                    id: "tours.view",
                    module: "tours",
                    action: "view",
                    name: "View Tours",
                    description: "View tour inventory",
                  },
                ],
              },
            ],
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getAdminPermissions.initiate()
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/permissions"
        );
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
        if ("data" in result && result.data) {
          expect(result.data.data.totalPermissions).toBe(20);
          expect(result.data.data.modules[0].module).toBe("tours");
        }
      });

      it("GET /admin/staff/:staffId/permissions fetches staff permissions", async () => {
        const mockResponse = {
          success: true,
          message: "Staff permissions retrieved successfully",
          data: {
            staffId: "stf-123",
            role: "staff",
            permissions: ["tours.view", "bookings.view"],
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getStaffPermissions.initiate("stf-123")
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/staff/stf-123/permissions"
        );
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
        if ("data" in result && result.data) {
          expect(result.data.data.staffId).toBe("stf-123");
          expect(result.data.data.permissions).toEqual(["tours.view", "bookings.view"]);
        }
      });

      it("PUT /admin/staff/:staffId/permissions updates staff permissions", async () => {
        const mockResponse = {
          success: true,
          message: "Staff permissions updated successfully",
          data: {
            staffId: "stf-123",
            role: "staff",
            permissions: ["tours.view", "bookings.view", "tours.create"],
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.updateStaffPermissions.initiate({
            staffId: "stf-123",
            permissions: ["tours.view", "bookings.view", "tours.create"],
          })
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/admin/staff/stf-123/permissions"
        );
        expect(capturedRequest?.method).toBe("PUT");
        expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
          permissions: ["tours.view", "bookings.view", "tours.create"],
        });
        expect("data" in result).toBe(true);
      });

      it("GET /auth/me/permissions fetches effective permissions", async () => {
        const mockResponse = {
          success: true,
          message: "Effective permissions retrieved successfully",
          data: {
            userId: "usr-staff-1",
            role: "staff",
            permissions: ["tours.view", "reports.view"],
          },
        };

        setupMockFetch(200, mockResponse);
        const store = makeStore();

        const result = await store.dispatch(
          adminApi.endpoints.getEffectivePermissions.initiate()
        );

        expect(capturedRequest?.url).toBe(
          "http://localhost:5000/api/v1/auth/me/permissions"
        );
        expect(capturedRequest?.method).toBe("GET");
        expect("data" in result).toBe(true);
        if ("data" in result && result.data) {
          expect(result.data.data.permissions).toEqual(["tours.view", "reports.view"]);
        }
      });
    });
  });

  describe("Commission Management Endpoints", () => {
    it("GET /admin/commissions fetches commissions list with filters", async () => {
      const mockResponse = {
        success: true,
        message: "Commissions retrieved successfully",
        data: {
          items: [
            {
              id: "comm-1234",
              bookingId: "book-1234",
              agentId: "agent-1234",
              ruleId: "rule-1234",
              rateType: "PERCENTAGE",
              rateValue: 10,
              baseAmount: 10000,
              amount: 1000,
              status: "ACTIVE",
              createdAt: "2026-10-25T10:00:00.000Z",
              updatedAt: "2026-10-25T10:00:00.000Z",
            },
          ],
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminCommissions.initiate({
          page: 1,
          limit: 10,
          status: "ACTIVE",
          agentId: "agent-1234",
        })
      );

      expect(capturedRequest?.url).toContain("/admin/commissions");
      expect(capturedRequest?.url).toContain("page=1");
      expect(capturedRequest?.url).toContain("limit=10");
      expect(capturedRequest?.url).toContain("status=ACTIVE");
      expect(capturedRequest?.url).toContain("agentId=agent-1234");
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });

    it("GET /admin/commissions/:commissionId fetches single commission details", async () => {
      const mockResponse = {
        success: true,
        message: "Commission retrieved successfully",
        data: {
          id: "comm-1234",
          bookingId: "book-1234",
          agentId: "agent-1234",
          ruleId: "rule-1234",
          rateType: "PERCENTAGE",
          rateValue: 10,
          baseAmount: 10000,
          amount: 1000,
          status: "ACTIVE",
          adjustments: [],
          createdAt: "2026-10-25T10:00:00.000Z",
          updatedAt: "2026-10-25T10:00:00.000Z",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminCommissionById.initiate("comm-1234")
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/commissions/comm-1234"
      );
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });

    it("PATCH /admin/commissions/:commissionId submits adjustment with amount and reason", async () => {
      const mockResponse = {
        success: true,
        message: "Commission adjusted successfully",
        data: {
          id: "comm-1234",
          amount: 850,
          status: "ACTIVE",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.adjustAdminCommission.initiate({
          commissionId: "comm-1234",
          input: {
            amount: 850,
            reason: "Agreed discount reduction with partner agent",
          },
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/commissions/comm-1234"
      );
      expect(capturedRequest?.method).toBe("PATCH");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        amount: 850,
        reason: "Agreed discount reduction with partner agent",
      });
      expect("data" in result).toBe(true);
    });

    it("GET /admin/commission-rules fetches active rule and historical policies", async () => {
      const mockResponse = {
        success: true,
        message: "Commission rules retrieved successfully",
        data: {
          activeRule: {
            id: "rule-1",
            rateType: "PERCENTAGE",
            rateValue: 10,
            isActive: true,
            createdById: "admin-1",
            createdAt: "2026-10-01T00:00:00.000Z",
          },
          items: [],
          page: 1,
          limit: 10,
          total: 1,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminCommissionRules.initiate({ page: 1, limit: 10 })
      );

      expect(capturedRequest?.url).toContain("/admin/commission-rules");
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });

    it("PUT /admin/commission-rules configures new commission policy", async () => {
      const mockResponse = {
        success: true,
        message: "Commission rule updated successfully",
        data: {
          id: "rule-2",
          rateType: "FIXED",
          rateValue: 500,
          isActive: true,
          createdById: "admin-1",
          createdAt: "2026-11-01T00:00:00.000Z",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.configureAdminCommissionRule.initiate({
          rateType: "FIXED",
          rateValue: 500,
        })
      );

      expect(capturedRequest?.url).toBe(
        "http://localhost:5000/api/v1/admin/commission-rules"
      );
      expect(capturedRequest?.method).toBe("PUT");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        rateType: "FIXED",
        rateValue: 500,
      });
      expect("data" in result).toBe(true);
    });

    it("GET /admin/reports/commissions fetches platform commission aggregate summary", async () => {
      const mockResponse = {
        success: true,
        message: "Commissions report retrieved successfully",
        data: {
          filters: { from: null, to: null, serviceType: null, agentId: null },
          count: 20,
          totalActiveAmount: 75000,
          byStatus: [
            { status: "ACTIVE", count: 18, totalAmount: 75000 },
            { status: "CANCELLED", count: 2, totalAmount: 4000 },
          ],
          items: [],
          page: 1,
          limit: 10,
          total: 2,
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.getAdminCommissionsReport.initiate()
      );

      expect(capturedRequest?.url).toContain("/admin/reports/commissions");
      expect(capturedRequest?.method).toBe("GET");
      expect("data" in result).toBe(true);
    });
  });

  describe("System Settings Endpoints", () => {
    it("GET /admin/settings retrieves configuration overview with masked secrets", async () => {
      const mockResponse = {
        success: true,
        data: {
          general: { platformName: "PhuketTours" },
          payment: { providerName: "Stripe", hasSecretKey: true, maskedSecretKey: "••••••••••••3210" },
          webhook: { endpointUrl: "https://api.phukettours.com/api/v1/webhooks/payment" },
          cloudinary: { cloudName: "dg83pvgls", hasApiSecret: true, maskedApiSecret: "••••••••••••abcd" },
          smtp: { host: "smtp.gmail.com", hasPass: true, maskedPass: "••••••••••••pass" },
          serverTime: "2026-11-02T12:00:00.000Z",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(adminApi.endpoints.getAdminSettings.initiate());

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");
      expect("data" in result).toBe(true);
    });

    it("PUT /admin/settings/general updates platform name and maintenance mode", async () => {
      setupMockFetch(200, { success: true, data: {} });
      const store = makeStore();

      await store.dispatch(
        adminApi.endpoints.updateAdminGeneralSettings.initiate({
          platformName: "Phuket Luxury Tours",
          maintenanceMode: false,
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings/general");
      expect(capturedRequest?.method).toBe("PUT");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        platformName: "Phuket Luxury Tours",
        maintenanceMode: false,
      });
    });

    it("PUT /admin/settings/payment updates payment credentials safely", async () => {
      setupMockFetch(200, { success: true, data: {} });
      const store = makeStore();

      await store.dispatch(
        adminApi.endpoints.updateAdminPaymentSettings.initiate({
          providerName: "Stripe",
          environment: "sandbox",
          publishableKey: "pk_test_123",
          secretKey: "sk_test_secret",
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings/payment");
      expect(capturedRequest?.method).toBe("PUT");
      expect(JSON.parse(capturedRequest?.body || "{}").secretKey).toBe("sk_test_secret");
    });

    it("PUT /admin/settings/webhook updates webhook signing secret and enabled flag", async () => {
      setupMockFetch(200, { success: true, data: {} });
      const store = makeStore();

      await store.dispatch(
        adminApi.endpoints.updateAdminWebhookSettings.initiate({
          signingSecret: "whsec_live_12345",
          enabled: true,
        })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings/webhook");
      expect(capturedRequest?.method).toBe("PUT");
    });

    it("POST /admin/settings/cloudinary/test tests real Cloudinary API connectivity", async () => {
      setupMockFetch(200, {
        success: true,
        data: { success: true, message: "Cloudinary API handshake successful", verifiedAt: "2026-11-02T12:00:00Z" },
      });
      const store = makeStore();

      const result = await store.dispatch(
        adminApi.endpoints.testAdminCloudinaryConnection.initiate()
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings/cloudinary/test");
      expect(capturedRequest?.method).toBe("POST");
      expect("data" in result).toBe(true);
    });

    it("POST /admin/settings/smtp/send-test dispatches test email to administrator", async () => {
      setupMockFetch(200, {
        success: true,
        data: { success: true, message: "Test email dispatched", recipient: "test@domain.com" },
      });
      const store = makeStore();

      await store.dispatch(
        adminApi.endpoints.sendAdminTestEmail.initiate({ recipientEmail: "test@domain.com" })
      );

      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/admin/settings/smtp/send-test");
      expect(capturedRequest?.method).toBe("POST");
      expect(JSON.parse(capturedRequest?.body || "{}").recipientEmail).toBe("test@domain.com");
    });

    it("GET /admin/settings/audit fetches paginated configuration audit records", async () => {
      setupMockFetch(200, {
        success: true,
        data: { logs: [], pagination: { total: 0, page: 1, limit: 10, totalPages: 1 } },
      });
      const store = makeStore();

      await store.dispatch(
        adminApi.endpoints.getAdminSettingAuditLogs.initiate({ category: "PAYMENT", page: 1 })
      );

      expect(capturedRequest?.url).toContain("/admin/settings/audit");
      expect(capturedRequest?.url).toContain("category=PAYMENT");
      expect(capturedRequest?.method).toBe("GET");
    });
  });
});



