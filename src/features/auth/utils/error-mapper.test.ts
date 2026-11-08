import { describe, it, expect } from "vitest";
import {
  parseApiError,
  formatErrorMessage,
  isTechnicalError,
} from "./error-mapper";

describe("error-mapper", () => {
  it("detects technical and Prisma errors correctly", () => {
    expect(isTechnicalError("Invalid prisma.user.findFirst() invocation")).toBe(true);
    expect(isTechnicalError("The column User.deletedAt does not exist in the current database")).toBe(true);
    expect(isTechnicalError("SELECT * FROM \"User\" WHERE id = 1")).toBe(true);
    expect(isTechnicalError("ECONNREFUSED 127.0.0.1:5432")).toBe(true);
    expect(isTechnicalError("Password must be at least 6 characters.")).toBe(false);
  });

  it("masks technical errors from 500 status code with friendly guidance", () => {
    const error = {
      status: 500,
      data: {
        message: "Invalid prisma.user.create() column User.deletedAt does not exist",
      },
    };
    const parsed = parseApiError(error, { context: "registration" });
    expect(parsed.isTechnical).toBe(true);
    expect(parsed.message).toBe("We're having trouble creating your account. Please try again shortly.");
  });

  it("handles network failure cleanly", () => {
    const error = { status: "FETCH_ERROR" };
    const parsed = parseApiError(error);
    expect(parsed.title).toBe("Connection Failed");
    expect(parsed.message).toContain("check your internet connection");
  });

  it("handles 401 Unauthorized appropriately in auth context", () => {
    const error = { status: 401 };
    const parsed = parseApiError(error, { context: "auth" });
    expect(parsed.message).toBe("Email address or password is incorrect.");
  });

  it("handles 403 Forbidden with support contact note", () => {
    const error = { status: 403 };
    const parsed = parseApiError(error, { context: "auth" });
    expect(parsed.message).toBe("Your account is currently inactive. Please contact support.");
  });

  it("preserves safe validation messages from backend", () => {
    const error = {
      status: 422,
      data: {
        message: "The invitation token has expired.",
      },
    };
    const parsed = parseApiError(error);
    expect(parsed.isTechnical).toBe(false);
    expect(parsed.message).toBe("The invitation token has expired.");
  });

  it("formats fallback correctly when unknown error occurs", () => {
    expect(formatErrorMessage(null, { fallback: "Custom failure" })).toBe("Custom failure");
  });
});

