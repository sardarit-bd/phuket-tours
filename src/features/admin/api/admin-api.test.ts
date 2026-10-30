import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  adminApi,
  useGetAdminRevenueReportQuery,
  useGetAdminBookingsReportQuery,
  useGetAdminPaymentsReportQuery,
  useGetAdminServicesReportQuery,
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

  it("exports all generated query hooks for admin analytics", () => {
    expect(typeof useGetAdminRevenueReportQuery).toBe("function");
    expect(typeof useGetAdminBookingsReportQuery).toBe("function");
    expect(typeof useGetAdminPaymentsReportQuery).toBe("function");
    expect(typeof useGetAdminServicesReportQuery).toBe("function");
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
});

