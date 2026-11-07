import { describe, it, expect } from "vitest";
import { getAuthErrorMessage } from "./auth-error";

describe("getAuthErrorMessage", () => {
  it("returns generic sign-in failed message for undefined/null/invalid input", () => {
    expect(getAuthErrorMessage(null)).toBe(
      "Sign-in failed. Please check your details and try again.",
    );
    expect(getAuthErrorMessage(undefined)).toBe(
      "Sign-in failed. Please check your details and try again.",
    );
    expect(getAuthErrorMessage("some string")).toBe(
      "Sign-in failed. Please check your details and try again.",
    );
  });

  it("maps 401 Unauthorized to invalid credentials message", () => {
    const error = {
      status: 401,
      data: { message: "Unauthorized" },
    };
    expect(getAuthErrorMessage(error)).toBe("Email address or password is incorrect.");
  });

  it("maps 403 Forbidden to account inactive message", () => {
    const error = {
      status: 403,
      data: { message: "Forbidden" },
    };
    expect(getAuthErrorMessage(error)).toBe(
      "Your account is currently inactive. Please contact support.",
    );
  });

  it("maps network errors (FETCH_ERROR) to connection error message", () => {
    const error = {
      status: "FETCH_ERROR",
    };
    expect(getAuthErrorMessage(error)).toBe(
      "Unable to connect. Please check your internet connection and try again.",
    );
  });

  it("maps 500, 502, 503, 504 server errors to safe user-friendly trouble message", () => {
    [500, 502, 503, 504].forEach((status) => {
      const error = {
        status,
        data: { message: "Internal server error" },
      };
      expect(getAuthErrorMessage(error)).toBe(
        "We're having trouble signing you in. Please try again shortly.",
      );
    });
  });

  it("blocks Prisma database errors and masks them with user-friendly trouble message", () => {
    const error = {
      status: 400,
      data: {
        message:
          "Invalid prisma.user.findFirst() invocation: The column User.deletedAt does not exist in the current database.",
      },
    };
    expect(getAuthErrorMessage(error)).toBe(
      "We're having trouble signing you in. Please try again shortly.",
    );
  });

  it("blocks SQL query leaks in standard Error objects", () => {
    const error = new Error("SELECT * FROM \"User\" WHERE deletedAt IS NULL failed");
    expect(getAuthErrorMessage(error)).toBe(
      "We're having trouble signing you in. Please try again shortly.",
    );
  });

  it("passes through legitimate non-technical validation error messages", () => {
    const error = {
      status: 422,
      data: {
        message: "Email verification code has expired.",
      },
    };
    expect(getAuthErrorMessage(error)).toBe("Email verification code has expired.");
  });
});

