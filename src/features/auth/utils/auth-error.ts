/**
 * Safely extracts a user-facing error message from an RTK Query or network error
 * without exposing sensitive stack traces, tokens, or credentials.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!error || typeof error !== "object") {
    return "An unexpected error occurred. Please try again.";
  }

  // Handle RTK Query FetchBaseQueryError
  if ("status" in error) {
    const fetchError = error as {
      status: number | string;
      data?: unknown;
    };

    if (fetchError.status === "FETCH_ERROR") {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    if (fetchError.status === 429) {
      if (
        fetchError.data &&
        typeof fetchError.data === "object" &&
        "message" in fetchError.data &&
        typeof (fetchError.data as { message: unknown }).message === "string"
      ) {
        return (fetchError.data as { message: string }).message;
      }
      return "Too many requests. Please wait a few minutes before trying again.";
    }

    if (
      fetchError.data &&
      typeof fetchError.data === "object" &&
      "message" in fetchError.data &&
      typeof (fetchError.data as { message: unknown }).message === "string"
    ) {
      return (fetchError.data as { message: string }).message;
    }

    if (fetchError.status === 401) {
      return "Invalid email or password.";
    }

    if (fetchError.status === 403) {
      return "Your account is deactivated. Please contact support.";
    }

    if (fetchError.status === 409) {
      return "An account with this email address already exists.";
    }

    if (fetchError.status === 500) {
      return "Server error occurred. Please try again later.";
    }
  }

  // Handle standard Error
  if ("message" in error && typeof (error as { message: unknown }).message === "string") {
    return (error as { message: string }).message;
  }

  return "An unexpected error occurred. Please try again.";
}
