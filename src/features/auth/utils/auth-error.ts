import { isTechnicalError } from "./error-mapper";

export { isTechnicalError };

/**
 * Safely extracts a user-facing error message from an RTK Query or network error
 * without exposing technical database errors, Prisma exceptions, SQL queries,
 * stack traces, tokens, or credentials.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "Sign-in failed. Please check your details and try again.";
  }

  // Handle RTK Query FetchBaseQueryError
  if ("status" in error) {
    const fetchError = error as {
      status: number | string;
      data?: unknown;
    };

    // 1. Network / Connection errors
    if (
      fetchError.status === "FETCH_ERROR" ||
      fetchError.status === "TIMEOUT_ERROR" ||
      fetchError.status === "PARSING_ERROR"
    ) {
      return "Unable to connect. Please check your internet connection and try again.";
    }

    // 2. Server errors (500, 502, 503, 504)
    if (
      typeof fetchError.status === "number" &&
      fetchError.status >= 500 &&
      fetchError.status <= 599
    ) {
      return "We're having trouble signing you in. Please try again shortly.";
    }

    // 3. Status 401 Unauthorized -> Invalid credentials
    if (fetchError.status === 401) {
      return "Email address or password is incorrect.";
    }

    // 4. Status 403 Forbidden -> Account inactive / deactivated
    if (fetchError.status === 403) {
      return "Your account is currently inactive. Please contact support.";
    }

    // 5. Status 429 Too Many Requests -> Rate limiting
    if (fetchError.status === 429) {
      if (
        fetchError.data &&
        typeof fetchError.data === "object" &&
        "message" in fetchError.data &&
        typeof (fetchError.data as { message: unknown }).message === "string"
      ) {
        const msg = (fetchError.data as { message: string }).message;
        if (!isTechnicalError(msg)) {
          return msg;
        }
      }
      return "Too many requests. Please wait a few minutes before trying again.";
    }

    // 6. Status 409 Conflict -> Already exists
    if (fetchError.status === 409) {
      if (
        fetchError.data &&
        typeof fetchError.data === "object" &&
        "message" in fetchError.data &&
        typeof (fetchError.data as { message: unknown }).message === "string"
      ) {
        const msg = (fetchError.data as { message: string }).message;
        if (!isTechnicalError(msg)) {
          return msg;
        }
      }
      return "An account with this email address already exists.";
    }

    // 7. Check for clean non-technical message in data.message
    if (
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "message" in fetchError.data &&
      typeof (fetchError.data as { message: unknown }).message === "string"
    ) {
      const msg = (fetchError.data as { message: string }).message;
      if (!isTechnicalError(msg)) {
        return msg;
      }
      return "We're having trouble signing you in. Please try again shortly.";
    }
  }

  // Handle standard Error instance if non-technical
  if ("message" in error && typeof (error as { message: unknown }).message === "string") {
    const msg = (error as { message: string }).message;
    if (!isTechnicalError(msg)) {
      return msg;
    }
    return "We're having trouble signing you in. Please try again shortly.";
  }

  return "Sign-in failed. Please check your details and try again.";
}
