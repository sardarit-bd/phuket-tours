import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges class names correctly", () => {
    const result = cn("text-sm", "font-medium", "text-foreground");
    expect(result).toBe("text-sm font-medium text-foreground");
  });

  it("handles conditional and falsy values", () => {
    const isPrimary = true;
    const isHidden = false;
    const result = cn(
      "base-class",
      isPrimary && "is-primary",
      isHidden && "is-hidden",
      undefined,
      null,
      ""
    );
    expect(result).toBe("base-class is-primary");
  });

  it("resolves conflicting Tailwind utility classes via tailwind-merge", () => {
    // Later class should override earlier class
    const result = cn("px-4 py-2", "px-6");
    expect(result).toBe("py-2 px-6");
  });

  it("handles array and object syntax supported by clsx", () => {
    const result = cn(["flex", "items-center"], { "justify-between": true, hidden: false });
    expect(result).toBe("flex items-center justify-between");
  });
});
