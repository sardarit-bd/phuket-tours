"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth/slices/auth-slice";
import { useGetMyAffiliateProfileQuery } from "../api/affiliate-api";

interface CustomerAffiliatePromoCardProps {
  onNavigate?: () => void;
}

function AffiliateRewardIllustration() {
  return (
    <svg
      viewBox="0 0 220 132"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-[108px] w-full max-w-[196px] select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="affBgGlow" x1="20" y1="10" x2="200" y2="122" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3297A3" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="affCardGrad" x1="56" y1="26" x2="164" y2="112" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0F9FA" />
        </linearGradient>
        <linearGradient id="affSeaGrad" x1="66" y1="62" x2="154" y2="96" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3297A3" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>
        <linearGradient id="affCoinGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Soft Ambient Backdrop */}
      <ellipse cx="110" cy="72" rx="88" ry="50" fill="url(#affBgGlow)" />

      {/* Decorative Sparkles */}
      <path d="M32 30L34 35L39 37L34 39L32 44L30 39L25 37L30 35L32 30Z" fill="#3297A3" fillOpacity="0.55" />
      <path d="M188 26L189.5 30L193.5 31.5L189.5 33L188 37L186.5 33L182.5 31.5L186.5 30L188 26Z" fill="#F59E0B" fillOpacity="0.8" />
      <circle cx="44" cy="96" r="3.5" fill="#38BDF8" fillOpacity="0.45" />
      <circle cx="180" cy="94" r="3" fill="#3297A3" fillOpacity="0.4" />

      {/* Central Travel Experience Share Card */}
      <rect
        x="56"
        y="26"
        width="108"
        height="82"
        rx="14"
        fill="url(#affCardGrad)"
        stroke="#3297A3"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />

      {/* Tropical Island & Ocean Scene inside Card */}
      <rect x="66" y="36" width="88" height="44" rx="8" fill="#E0F4F7" />
      {/* Sun */}
      <circle cx="136" cy="48" r="6" fill="#FBBF24" />
      {/* Distant Limestone Karst Islands (Phuket / Phi Phi silhouette) */}
      <path d="M74 68C77 56 84 52 90 56C94 58 97 63 102 68H74Z" fill="#2A8692" fillOpacity="0.65" />
      <path d="M96 68C101 52 110 47 118 53C123 57 126 63 130 68H96Z" fill="#3297A3" />
      {/* Ocean Wave */}
      <path d="M66 67H154V72C154 76.4183 150.418 80 146 80H74C69.5817 80 66 76.4183 66 72V67Z" fill="url(#affSeaGrad)" />
      <path d="M78 73C84 71 90 75 96 73C102 71 108 75 114 73C120 71 126 75 132 73" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />

      {/* Share Link Pill Bar */}
      <rect x="66" y="88" width="58" height="10" rx="5" fill="#E6F4F6" />
      <rect x="72" y="92" width="32" height="2.5" rx="1.25" fill="#3297A3" fillOpacity="0.7" />
      <rect x="128" y="88" width="26" height="10" rx="5" fill="#3297A3" />
      <path d="M138 93H144M144 93L142 91M144 93L142 95" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />

      {/* Floating Reward Coin — Top Right */}
      <g>
        <circle cx="166" cy="34" r="15" fill="url(#affCoinGrad)" stroke="#FFFFFF" strokeWidth="2.5" />
        <circle cx="166" cy="34" r="10.5" stroke="#FFFBEB" strokeOpacity="0.7" strokeWidth="1.2" />
        <text
          x="166"
          y="38.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="13"
          fontWeight="800"
          fontFamily="sans-serif"
        >
          $
        </text>
      </g>

      {/* Floating Referral Link Badge — Left */}
      <g>
        <rect x="26" y="54" width="38" height="24" rx="12" fill="#FFFFFF" stroke="#3297A3" strokeOpacity="0.28" strokeWidth="1.5" />
        <path
          d="M41.5 66H48.5M43 63H40.5C38.8431 63 37.5 64.3431 37.5 66C37.5 67.6569 38.8431 69 40.5 69H43M47 63H49.5C51.1569 63 52.5 64.3431 52.5 66C52.5 67.6569 51.1569 69 49.5 69H47"
          stroke="#3297A3"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </g>

      {/* Small Floating Reward Coin — Bottom Right */}
      <g>
        <circle cx="168" cy="96" r="9.5" fill="url(#affCoinGrad)" stroke="#FFFFFF" strokeWidth="2" />
        <text
          x="168"
          y="99.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="9"
          fontWeight="800"
          fontFamily="sans-serif"
        >
          %
        </text>
      </g>
    </svg>
  );
}

export function CustomerAffiliatePromoCard({
  onNavigate,
}: CustomerAffiliatePromoCardProps) {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const { data: profileRes, isError } = useGetMyAffiliateProfileQuery(undefined, {
    skip: !isAuthenticated,
  });

  const status = !isError ? profileRes?.data?.status ?? null : null;

  return (
    <div
      data-testid="customer-affiliate-promo-card"
      className="relative overflow-hidden rounded-2xl border border-[#3297A3]/20 bg-gradient-to-b from-[#EDF8FA] via-[#F5FBFD] to-[#FFFFFF] px-4 py-4 text-center shadow-2xs"
    >
      {/* Subtle decorative corner glow */}
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-[#3297A3]/10 blur-xl"
        aria-hidden="true"
      />

      {/* Central Illustration */}
      <div className="relative mb-2">
        <AffiliateRewardIllustration />
      </div>

      {/* Centered Headline & Supporting Copy */}
      <h3 className="font-outfit text-[15px] font-bold tracking-tight text-[#18282A] leading-snug">
        Turn Your Network Into Rewards!
      </h3>
      <p className="mt-1.5 text-xs leading-relaxed text-[#556972]">
        Share Phuket adventures with your audience and earn commission on successful bookings.
      </p>

      {/* Prominent Full-Width Status-Aware CTA */}
      <div className="mt-3.5">
        {status === "SUSPENDED" ? (
          <div
            data-testid="affiliate-promo-suspended"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Account Suspended</span>
          </div>
        ) : status === "APPROVED" ? (
          <Link
            href="/dashboard/affiliate"
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#3297A3] px-3 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#287D87]"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Open Affiliate Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        ) : status === "PENDING" ? (
          <Link
            href="/affiliate"
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Application Pending</span>
          </Link>
        ) : status === "REJECTED" ? (
          <Link
            href="/affiliate"
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#18282A] px-3 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#263238]"
          >
            <span>Reapply Now</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <Link
            href="/affiliate"
            onClick={onNavigate}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#3297A3] px-3 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#287D87]"
          >
            <span>Join Affiliate Program</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
