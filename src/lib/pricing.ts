/**
 * Shared tour discount pricing utilities.
 *
 * `discountedPrice` in the data model represents the final discounted selling
 * price (not a discount amount or percentage). A discount is valid only when
 * `discountedPrice` is a finite positive number strictly less than `basePrice`.
 */

export interface ResolvedTourPricing {
  /** Effective selling price (discountedPrice if valid, otherwise basePrice). */
  effectivePrice: number;
  /** Original adult price when a valid discount exists; undefined otherwise. */
  originalPrice: number | undefined;
  /** Savings amount (basePrice - discountedPrice) when valid, otherwise 0. */
  savings: number;
  /** Rounded discount percentage when valid; undefined otherwise. */
  discountPercentage: number | undefined;
  /** Whether a valid discount applies. */
  hasDiscount: boolean;
}

export function isValidDiscount(
  basePrice: number,
  discountedPrice: number | null | undefined
): discountedPrice is number {
  return (
    typeof basePrice === "number" &&
    Number.isFinite(basePrice) &&
    basePrice > 0 &&
    typeof discountedPrice === "number" &&
    Number.isFinite(discountedPrice) &&
    discountedPrice > 0 &&
    discountedPrice < basePrice
  );
}

export function resolveTourPricing(
  basePrice: number,
  discountedPrice: number | null | undefined
): ResolvedTourPricing {
  const hasDiscount = isValidDiscount(basePrice, discountedPrice);

  if (!hasDiscount) {
    return {
      effectivePrice: basePrice,
      originalPrice: undefined,
      savings: 0,
      discountPercentage: undefined,
      hasDiscount: false,
    };
  }

  const savings = basePrice - discountedPrice;
  const discountPercentage = Math.round((savings / basePrice) * 100);

  return {
    effectivePrice: discountedPrice,
    originalPrice: basePrice,
    savings,
    discountPercentage: discountPercentage > 0 ? discountPercentage : undefined,
    hasDiscount: true,
  };
}

