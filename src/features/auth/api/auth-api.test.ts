import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  authApi,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  type AuthUserResponse,
  type UserProfileResponse,
  type MessageResponse,
} from "./auth-api";
import { makeStore } from "@/store";

describe("authApi RTK Query endpoints", () => {
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

  it("exports all generated hooks for next phases", () => {
    expect(typeof useLoginMutation).toBe("function");
    expect(typeof useRegisterMutation).toBe("function");
    expect(typeof useLogoutMutation).toBe("function");
    expect(typeof useGetMeQuery).toBe("function");
    expect(typeof useLazyGetMeQuery).toBe("function");
  });

  describe("POST /auth/login", () => {
    it("sends POST request to /auth/login with credentials and body", async () => {
      const mockResponse: AuthUserResponse = {
        success: true,
        message: "Login successful",
        data: {
          id: "u-123",
          name: "John Doe",
          email: "john@example.com",
          role: "customer",
        },
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        authApi.endpoints.login.initiate({
          email: "john@example.com",
          password: "password123",
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/auth/login");
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedRequest?.credentials).toBe("include");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        email: "john@example.com",
        password: "password123",
      });

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data).toEqual(mockResponse);
        expect(result.data.data.role).toBe("customer");
      }
    });

    it("handles login 401 error response properly", async () => {
      const mockError = {
        success: false,
        message: "Invalid email or password",
        data: null,
      };

      setupMockFetch(401, mockError);
      const store = makeStore();

      const result = await store.dispatch(
        authApi.endpoints.login.initiate({
          email: "wrong@example.com",
          password: "wrongpassword",
        })
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect(result.error).toBeDefined();
        expect((result.error as { status: number }).status).toBe(401);
        expect((result.error as { data: unknown }).data).toEqual(mockError);
      }
    });
  });

  describe("POST /auth/register", () => {
    it("sends POST request to /auth/register with user data and credentials", async () => {
      const mockResponse: AuthUserResponse = {
        success: true,
        message: "User registered successfully",
        data: {
          id: "u-456",
          name: "Jane Doe",
          email: "jane@example.com",
          role: "customer",
        },
      };

      setupMockFetch(201, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(
        authApi.endpoints.register.initiate({
          name: "Jane Doe",
          email: "jane@example.com",
          password: "securepassword123",
        })
      );

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/auth/register");
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedRequest?.credentials).toBe("include");
      expect(JSON.parse(capturedRequest?.body || "{}")).toEqual({
        name: "Jane Doe",
        email: "jane@example.com",
        password: "securepassword123",
      });

      expect("data" in result).toBe(true);
      if ("data" in result) {
        expect(result.data).toEqual(mockResponse);
      }
    });

    it("handles register 409 conflict error properly", async () => {
      const mockError = {
        success: false,
        message: "Email already registered",
        data: null,
      };

      setupMockFetch(409, mockError);
      const store = makeStore();

      const result = await store.dispatch(
        authApi.endpoints.register.initiate({
          name: "Duplicate User",
          email: "duplicate@example.com",
          password: "securepassword123",
        })
      );

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect((result.error as { status: number }).status).toBe(409);
        expect((result.error as { data: unknown }).data).toEqual(mockError);
      }
    });
  });

  describe("POST /auth/logout", () => {
    it("sends POST request to /auth/logout with credentials", async () => {
      const mockResponse: MessageResponse = {
        success: true,
        message: "Logged out successfully",
        data: null,
      };

      setupMockFetch(200, mockResponse);
      const store = makeStore();

      const result = await store.dispatch(authApi.endpoints.logout.initiate());

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/auth/logout");
      expect(capturedRequest?.method).toBe("POST");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data).toEqual(mockResponse);
        expect(result.data.data).toBeNull();
      }
    });
  });

  describe("GET /auth/me", () => {
    it("sends GET request to /auth/me with credentials and returns user profile", async () => {
      const mockProfile: UserProfileResponse = {
        success: true,
        message: "Profile retrieved successfully",
        data: {
          id: "u-123",
          name: "John Doe",
          email: "john@example.com",
          phone: "+66 81 234 5678",
          role: "customer",
          status: "active",
          createdAt: "2026-01-01T10:00:00.000Z",
        },
      };

      setupMockFetch(200, mockProfile);
      const store = makeStore();

      const result = await store.dispatch(authApi.endpoints.getMe.initiate());

      expect(capturedRequest).toBeDefined();
      expect(capturedRequest?.url).toBe("http://localhost:5000/api/v1/auth/me");
      expect(capturedRequest?.method).toBe("GET");
      expect(capturedRequest?.credentials).toBe("include");

      expect("data" in result).toBe(true);
      if ("data" in result && result.data) {
        expect(result.data).toEqual(mockProfile);
        expect(result.data.data.phone).toBe("+66 81 234 5678");
        expect(result.data.data.status).toBe("active");
      }
    });

    it("handles 401 unauthenticated for /auth/me", async () => {
      const mockError = {
        success: false,
        message: "Unauthorized, token missing",
        data: null,
      };

      setupMockFetch(401, mockError);
      const store = makeStore();

      const result = await store.dispatch(authApi.endpoints.getMe.initiate());

      expect("error" in result).toBe(true);
      if ("error" in result) {
        expect((result.error as { status: number }).status).toBe(401);
      }
    });
  });
});
