"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Users, Check, ArrowRight, CalendarCheck } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { Tour, TourPricingTier } from "@/features/tours/types/tour";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/slices/auth-slice";

/**
 * Sticky booking summary card shown beside the gallery on desktop and
 * after the gallery on mobile.
 *
 * Pricing rules:
 *  - Uses the tour's starting (adult base) price from the backend.
 *  - When a discount exists, the original price is shown struck-through
 *    and the discounted price is emphasized.
 *  - A valid zero (explicitly free) renders "Free".
 *  - No valid price → a subtle "Contact for pricing" note (not a large
 *    "Price unavailable" heading).
 */
export function BookingSummaryCard({ tour }: { tour: Tour }) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { price } = tour;
  const currency = price.currency || "USD";

  const formatCurrency = (amount: number): string => {
    try {
      return formatPrice(amount, currency);
    } catch {
      return `${currency} ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
  };

  const hasPrice = price.hasPrice !== false;
  const isFree = hasPrice && price.amount === 0;
  const hasDiscount =
    price.originalAmount !== undefined &&
    price.originalAmount > price.amount &&
    price.amount > 0;

  // Starting price display.
  let priceValue: string;
  if (!hasPrice) {
    priceValue = "";
  } else if (isFree) {
    priceValue = "Free";
  } else if (hasDiscount) {
    // Emphasized price is the discounted amount; original is struck-through.
    priceValue = formatCurrency(price.amount);
  } else {
    priceValue = formatCurrency(price.amount);
  }

  const primaryLabel = hasPrice ? (isFree ? "Free" : priceValue) : "";

  // Build the per-person suffix. The starting price is the adult base price.
  const perPerson = price.perPersonLabel || "per person";

  // Package pricing tiers (child / infant / custom options) — compact list.
  const tiers = tour.pricingTiers ?? [];

  return (
    <div className="rounded-2xl border border-[#E5EAED] bg-white p-5 shadow-2xs">
      {/* Price block */}
      <div>
        <div className="flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm text-[#8A9A9C] line-through">
              {formatCurrency(price.originalAmount!)}
            </span>
          )}
          {hasPrice ? (
            <>
              <span className="text-2xl font-bold text-primary leading-tight">
                {priceValue}
              </span>
              <span className="text-xs font-medium text-[#8A9A9C]">
                {perPerson}
              </span>
            </>
          ) : (
            <span className="text-sm font-medium text-[#8A9A9C]">
              Contact for pricing
            </span>
          )}
        </div>
        {hasDiscount && (
          <p className="mt-0.5 text-[11px] font-semibold text-[#0E7A67]">
            Save {formatCurrency(price.originalAmount! - price.amount)}
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href={
          isAuthenticated
            ? `/checkout?tourId=${encodeURIComponent(tour.id)}`
            : `/sign-in?redirect=${encodeURIComponent(`/checkout?tourId=${encodeURIComponent(tour.id)}`)}`
        }
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
      >
        Book Now
        <ArrowRight className="h-4 w-4" />
      </Link>

      {/* Quick facts */}
      <div className="mt-5 space-y-2.5 border-t border-[#EEF2F3] pt-4">
        <div className="flex items-center gap-2 text-xs text-[#5C6C6E]">
          <Clock className="h-3.5 w-3.5 shrink-0 text-[#8A9A9C]" />
          <span>{tour.duration}</span>
        </div>
        {tour.groupSize && (
          <div className="flex items-center gap-2 text-xs text-[#5C6C6E]">
            <Users className="h-3.5 w-3.5 shrink-0 text-[#8A9A9C]" />
            <span>Up to {tour.groupSize} guests</span>
          </div>
        )}
        {tour.scheduleDetails?.isDaily && (
          <div className="flex items-center gap-2 text-xs text-[#5C6C6E]">
            <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-[#8A9A9C]" />
            <span>Available daily</span>
          </div>
        )}
      </div>

      {/* Package pricing tiers (when present) */}
      {tiers.length > 0 && (
        <div className="mt-5 border-t border-[#EEF2F3] pt-4">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#74818A]">
            Package pricing
          </p>
          <ul className="space-y-2">
            {tiers.map((tier, idx) => (
              <PricingTierRow key={idx} tier={tier} currency={currency} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function PricingTierRow({
  tier,
  currency,
}: {
  tier: TourPricingTier;
  currency: string;
}) {
  const label =
    tier.price === 0
      ? "Free of charge"
      : (() => {
          try {
            return formatPrice(tier.price, currency);
          } catch {
            return `${currency} ${tier.price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
          }
        })();

  return (
    <li className="flex items-center justify-between gap-3 text-xs">
      <span className="flex min-w-0 items-center gap-1.5 text-[#5C6C6E]">
        <Check className="h-3 w-3 shrink-0 text-[#0E7A67]" />
        <span className="truncate font-medium">{tier.tierName}</span>
      </span>
      <span
        className={cn(
          "shrink-0 font-bold",
          tier.price === 0 ? "text-[#0E7A67]" : "text-primary"
        )}
      >
        {label}
      </span>
    </li>
  );
}
