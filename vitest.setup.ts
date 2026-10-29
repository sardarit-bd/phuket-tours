import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Fix Node.js 20+ undici Request vs jsdom AbortSignal mismatch
if (typeof globalThis.Request !== "undefined") {
  const OriginalRequest = globalThis.Request;
  globalThis.Request = class CompatibleRequest extends OriginalRequest {
    constructor(input: RequestInfo | URL, init?: RequestInit) {
      try {
        super(input, init);
      } catch {
        if (init?.signal) {
          const { signal, ...rest } = init;
          super(input, rest);
          Object.defineProperty(this, "signal", {
            value: signal,
            configurable: true,
          });
        } else {
          super(input, init);
        }
      }
    }
  } as unknown as typeof Request;
}

afterEach(() => {
  cleanup();
});
