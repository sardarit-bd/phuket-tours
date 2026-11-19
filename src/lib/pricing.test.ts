import { describe, it, expect } from "vitest";
import { isValidDiscount, resolveTourPricing } from "./pricing";

describe("isValidDiscount", () => {
  it("returns true when discountedPrice is positive and strictly less than basePrice", () => {
    expect(isValidDiscount(4530, 99)).toBe(true);
    expect(isValidDiscount(100, 99.99)).toBe(true);
  });

  it("returns false when discountedPrice is missing, null, or undefined", () => {
    expect(isValidDiscount(4530, null)).toBe(false);
    expect(isValidDiscount(4530, undefined)).toBe(false);
  });

  it("returns false when discountedPrice is zero or negative", () => {
    expect(isValidDiscount(4530, 0)).toBe(false);
    expect(isValidDiscount(4530, -50)).toBe(false);
  });

  it("returns false when discountedPrice is equal to or greater than basePrice", () => {
    expect(isValidDiscount(4530, 4530)).toBe(false);
    expect(isValidDiscount(4530, 5000)).toBe(false);
  });

  it("returns false when values are NaN or Infinity", () => {
    expect(isValidDiscount(4530, NaN)).toBe(false);
    expect(isValidDiscount(NaN, 99)).toBe(false);
    expect(isValidDiscount(4530, Infinity)).toBe(false);
  });
});

describe("resolveTourPricing", () => {
  it("resolves effectivePrice, originalPrice, savings, and discountPercentage for valid discount", () => {
    const result = resolveTourPricing(4530, 99);
    expect(result).toEqual({
      effectivePrice: 99,
      originalPrice: 4530,
      savings: 4431,
      discountPercentage: 98,
      hasDiscount: true,
    });
  });

  it("falls back to basePrice with no discount when discountedPrice is invalid", () => {
    expect(resolveTourPricing(4530, null)).toEqual({
      effectivePrice: 4530,
      originalPrice: undefined,
      savings: 0,
      discountPercentage: undefined,
      hasDiscount: false,
    });

    expect(resolveTourPricing(4530, 4530)).toEqual({
      effectivePrice: 4530,
      originalPrice: undefined,
      savings: 0,
      discountPercentage: undefined,
      hasDiscount: false,
    });

    expect(resolveTourPricing(4530, 5000)).toEqual({
      effectivePrice: 4530,
      originalPrice: undefined,
      savings: 0,
      discountPercentage: undefined,
      hasDiscount: false,
    });
  });
});

