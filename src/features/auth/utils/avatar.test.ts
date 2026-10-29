import { describe, it, expect } from "vitest";
import { getInitials } from "./avatar";

describe("getInitials utility", () => {
  it("extracts two initials from first and last name", () => {
    expect(getInitials("Somchai Saetang")).toBe("SS");
    expect(getInitials("Elena Rostova")).toBe("ER");
    expect(getInitials("John Michael Doe")).toBe("JD");
  });

  it("extracts first two letters when only a single word name is provided", () => {
    expect(getInitials("Admin")).toBe("AD");
    expect(getInitials("Alex")).toBe("AL");
    expect(getInitials("A")).toBe("A");
  });

  it("handles whitespace and casing properly", () => {
    expect(getInitials("  jane   doe  ")).toBe("JD");
    expect(getInitials("mary")).toBe("MA");
  });

  it("returns default PT for empty, null, or undefined values", () => {
    expect(getInitials("")).toBe("PT");
    expect(getInitials("   ")).toBe("PT");
    expect(getInitials(null)).toBe("PT");
    expect(getInitials(undefined)).toBe("PT");
  });
});
