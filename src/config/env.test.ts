import { describe, it, expect } from "vitest";
import { env, envSchema } from "./env";

describe("env configuration", () => {
  it("defaults NEXT_PUBLIC_API_URL to http://localhost:5000/api/v1 when unset", () => {
    const result = envSchema.parse({});
    expect(result.NEXT_PUBLIC_API_URL).toBe("http://localhost:5000/api/v1");
  });

  it("defaults NEXT_PUBLIC_APP_URL to http://localhost:3000 when unset", () => {
    const result = envSchema.parse({});
    expect(result.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
  });

  it("allows overriding NEXT_PUBLIC_API_URL with a valid URL", () => {
    const customUrl = "https://staging-api.phukettours.com/api/v1";
    const result = envSchema.parse({
      NEXT_PUBLIC_API_URL: customUrl,
    });
    expect(result.NEXT_PUBLIC_API_URL).toBe(customUrl);
  });

  it("allows overriding NEXT_PUBLIC_APP_URL with a valid URL", () => {
    const customUrl = "https://staging.phukettours.com";
    const result = envSchema.parse({
      NEXT_PUBLIC_APP_URL: customUrl,
    });
    expect(result.NEXT_PUBLIC_APP_URL).toBe(customUrl);
  });

  it("rejects an invalid NEXT_PUBLIC_API_URL string", () => {
    expect(() =>
      envSchema.parse({
        NEXT_PUBLIC_API_URL: "not-a-valid-url",
      })
    ).toThrow();
  });

  it("exports a valid runtime env object matching the backend v1 prefix", () => {
    expect(env.NEXT_PUBLIC_API_URL).toMatch(/^https?:\/\/.+\/api\/v1\/?$/);
    expect(env.NEXT_PUBLIC_APP_URL).toMatch(/^https?:\/\/.+/);
  });

  it("only exposes public NEXT_PUBLIC configuration without secrets", () => {
    const envKeys = Object.keys(env);
    expect(envKeys.every((key) => key.startsWith("NEXT_PUBLIC_"))).toBe(true);
    expect(envKeys).toContain("NEXT_PUBLIC_API_URL");
    expect(envKeys).toContain("NEXT_PUBLIC_APP_URL");
  });
});
