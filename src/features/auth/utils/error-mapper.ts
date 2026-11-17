/**
 * Comprehensive, safe, project-wide error mapping utility.
 * Sanitizes technical database/Prisma errors, network drops, rate limits,
 * authentication/authorization failures, and server crashes into polished,
 * user-friendly human readable messages with recovery instructions.
 */

// Patterns indicating technical/raw database/backend/stack trace errors
export const TECHNICAL_ERROR_PATTERNS = [
  /prisma/i,
  /database/i,
  /syntax/i,
  /stack\s*trace/i,
  /internal\s*server\s*error/i,
  /invocation/i,
  /unknown\s*arg/i,
  /query/i,
  /select\s+/i,
  /insert\s+into/i,
  /update\s+/i,
  /delete\s+from/i,
  /column/i,
  /relation/i,
  /constraint/i,
  /foreign\s*key/i,
  /unique\s*key/i,
  /null\s*constraint/i,
  /typeerror/i,
  /referenceerror/i,
  /econnrefused/i,
  /connect/i,
  /postgres/i,
  /psql/i,
  /sequel/i,
  /sqlite/i,
  /migration/i,
  /p20\d{2}/i, // Prisma error codes e.g. P2002, P2025
];

export function isTechnicalError(message: string): boolean {
  if (!message || typeof message !== "string") return false;
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

export interface ErrorMapperOptions {
  /** The application domain/context for custom context-aware fallbacks */
  context?: "auth" | "registration" | "booking" | "payment" | "profile" | "admin" | "general";
  /** Custom fallback message if specific code is not matched */
  fallback?: string;
}

export interface ParsedError {
  status?: number | string;
  code?: string;
  title?: string;
  message: string;
  isTechnical: boolean;
}

/**
 * Parses any incoming error object (RTK Query FetchBaseQueryError, SerializedError, standard Error, string)
 * into a safe, structured representation with user-friendly text.
 */
export function parseApiError(
  error: unknown,
  optionsOrFallback: ErrorMapperOptions | string = {}
): ParsedError {
  const options: ErrorMapperOptions =
    typeof optionsOrFallback === "string"
      ? { fallback: optionsOrFallback }
      : optionsOrFallback;
  const context = options.context ?? "general";

  // 1. Primitive string or null/undefined
  if (!error) {
    return {
      message: options.fallback || getDefaultFallback(context),
      isTechnical: false,
    };
  }

  if (typeof error === "string") {
    if (isTechnicalError(error)) {
      return {
        message: "An unexpected system error occurred. Please try again shortly.",
        isTechnical: true,
      };
    }
    return {
      message: error,
      isTechnical: false,
    };
  }

  if (typeof error !== "object") {
    return {
      message: options.fallback || getDefaultFallback(context),
      isTechnical: false,
    };
  }

  // 2. FetchBaseQueryError from RTK Query
  if ("status" in error) {
    const fetchError = error as {
      status: number | string;
      data?: unknown;
    };

    const status = fetchError.status;

    // A. Network / Timeout failures
    if (
      status === "FETCH_ERROR" ||
      status === "TIMEOUT_ERROR" ||
      status === "PARSING_ERROR"
    ) {
      return {
        status,
        title: "Connection Failed",
        message: "Unable to connect. Please check your internet connection and try again.",
        isTechnical: false,
      };
    }

    // Extract potential server message if available
    let rawServerMsg: string | undefined;
    let errorCode: string | undefined;

    if (fetchError.data && typeof fetchError.data === "object") {
      const dataObj = fetchError.data as Record<string, unknown>;
      if (typeof dataObj.message === "string") {
        rawServerMsg = dataObj.message;
      } else if (typeof dataObj.error === "string") {
        rawServerMsg = dataObj.error;
      }
      if (typeof dataObj.code === "string") {
        errorCode = dataObj.code;
      }
    }

    // B. Server 5xx errors (500, 502, 503, 504)
    if (typeof status === "number" && status >= 500 && status <= 599) {
      if (status === 503) {
        return {
          status,
          code: errorCode,
          title: "Service Unavailable",
          message: "The service is temporarily unavailable. Please try again in a few minutes.",
          isTechnical: false,
        };
      }
      if (status === 502) {
        return {
          status,
          code: errorCode,
          title: "Gateway Error",
          message: "Unable to communicate with the external service provider. Please try again shortly.",
          isTechnical: false,
        };
      }

      // Check if server returned a safe, explicitly intended error message (e.g. from AppError)
      if (rawServerMsg && !isTechnicalError(rawServerMsg) && rawServerMsg !== "Internal Server Error") {
        return {
          status,
          code: errorCode,
          title: "Server Issue",
          message: rawServerMsg,
          isTechnical: false,
        };
      }

      const defaultServerMsg =
        context === "auth"
          ? "We're having trouble signing you in. Please try again shortly."
          : context === "registration"
          ? "We're having trouble creating your account. Please try again shortly."
          : "We encountered an issue on our servers. Please try again in a few moments.";

      return {
        status,
        code: errorCode,
        title: "Server Error",
        message: defaultServerMsg,
        isTechnical: true,
      };
    }

    // C. 401 Unauthorized
    if (status === 401) {
      const msg =
        context === "auth"
          ? "Email address or password is incorrect."
          : "Your session has expired. Please sign in again to continue.";
      return {
        status,
        code: errorCode,
        title: "Authentication Required",
        message: msg,
        isTechnical: false,
      };
    }

    // D. 403 Forbidden
    if (status === 403) {
      const msg =
        context === "auth"
          ? "Your account is currently inactive. Please contact support."
          : "You do not have permission to perform this action.";
      return {
        status,
        code: errorCode,
        title: "Access Restricted",
        message: msg,
        isTechnical: false,
      };
    }

    // E. 404 Not Found
    if (status === 404) {
      return {
        status,
        code: errorCode,
        title: "Not Found",
        message: rawServerMsg && !isTechnicalError(rawServerMsg)
          ? rawServerMsg
          : "The requested resource could not be found.",
        isTechnical: false,
      };
    }

    // F. 409 Conflict
    if (status === 409) {
      const msg =
        rawServerMsg && !isTechnicalError(rawServerMsg)
          ? rawServerMsg
          : context === "auth" || context === "registration"
          ? "An account with this email address already exists."
          : "This record conflicts with existing data.";
      return {
        status,
        code: errorCode,
        title: "Conflict",
        message: msg,
        isTechnical: false,
      };
    }

    // G. 429 Too Many Requests (Rate Limiting)
    if (status === 429) {
      const msg =
        rawServerMsg && !isTechnicalError(rawServerMsg)
          ? rawServerMsg
          : "Too many requests. Please wait a few minutes before trying again.";
      return {
        status,
        code: errorCode,
        title: "Too Many Requests",
        message: msg,
        isTechnical: false,
      };
    }

    // H. Other 4xx client errors (e.g. 400, 422 validation errors)
    if (rawServerMsg) {
      if (isTechnicalError(rawServerMsg)) {
        return {
          status,
          code: errorCode,
          title: "Request Error",
          message: options.fallback || getDefaultFallback(context),
          isTechnical: true,
        };
      }
      return {
        status,
        code: errorCode,
        title: "Validation Error",
        message: rawServerMsg,
        isTechnical: false,
      };
    }
  }

  // 3. Standard JS Error
  if ("message" in error && typeof (error as { message: unknown }).message === "string") {
    const rawMsg = (error as { message: string }).message;
    if (isTechnicalError(rawMsg)) {
      return {
        title: "System Error",
        message: options.fallback || "An unexpected system error occurred. Please try again.",
        isTechnical: true,
      };
    }
    return {
      message: rawMsg,
      isTechnical: false,
    };
  }

  // 4. Object with data.message or error property without HTTP status
  if ("data" in error && typeof (error as { data: unknown }).data === "object" && (error as { data: unknown }).data !== null) {
    const dataObj = (error as { data: Record<string, unknown> }).data;
    if (typeof dataObj.message === "string") {
      if (!isTechnicalError(dataObj.message)) {
        return {
          message: dataObj.message,
          isTechnical: false,
        };
      }
    }
  }

  return {
    message: options.fallback || getDefaultFallback(context),
    isTechnical: false,
  };
}

/**
 * Returns a human-friendly string message directly from any error.
 */
export function formatErrorMessage(
  error: unknown,
  optionsOrFallback: ErrorMapperOptions | string = {}
): string {
  const parsed = parseApiError(error, optionsOrFallback);
  return parsed.message;
}

function getDefaultFallback(context: string): string {
  switch (context) {
    case "auth":
      return "Sign-in failed. Please check your details and try again.";
    case "registration":
      return "Unable to create your account. Please check your details and try again.";
    case "booking":
      return "Unable to process your reservation. Please try again.";
    case "payment":
      return "Unable to process payment transaction. Please try again.";
    case "profile":
      return "Failed to save profile changes. Please try again.";
    case "admin":
      return "Unable to complete administrative action. Please try again.";
    default:
      return "An error occurred. Please try again.";
  }
}
