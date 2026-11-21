"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Share2,
  Link2,
  Percent,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/features/auth/slices/auth-slice";
import type { UserRole } from "@/features/auth/types/auth";
import {
  useApplyAsAffiliateMutation,
  useGetMyAffiliateProfileQuery,
} from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PAYOUT_METHODS = ["Bank Transfer", "Wise", "PayPal"] as const;

export function getDashboardHomeForRole(role?: UserRole | null): string {
  if (role === "admin") return "/dashboard/admin";
  if (role === "staff") return "/dashboard/staff";
  if (role === "agent") return "/dashboard/agent";
  if (role === "affiliate") return "/dashboard/affiliate";
  return "/dashboard";
}

function HeroPartnerIllustration() {
  return (
    <svg
      viewBox="0 0 280 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto h-auto w-full max-w-[260px] select-none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="heroGlow" x1="20" y1="10" x2="260" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3297A3" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.06" />
        </linearGradient>
        <linearGradient id="heroSea" x1="70" y1="88" x2="210" y2="132" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3297A3" />
          <stop offset="100%" stopColor="#0E7490" />
        </linearGradient>
        <linearGradient id="heroCoin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      <ellipse cx="140" cy="100" rx="115" ry="70" fill="url(#heroGlow)" />
      <rect
        x="62"
        y="34"
        width="156"
        height="118"
        rx="18"
        fill="#FFFFFF"
        stroke="#3297A3"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />
      <rect x="76" y="48" width="128" height="62" rx="10" fill="#E4F5F7" />
      <circle cx="178" cy="64" r="8" fill="#FBBF24" />
      <path d="M88 94C93 78 102 72 110 78C116 82 120 88 126 94H88Z" fill="#2A8692" fillOpacity="0.6" />
      <path d="M118 94C125 72 138 64 148 72C156 78 160 86 166 94H118Z" fill="#3297A3" />
      <path d="M76 92H204V100C204 105.523 199.523 110 194 110H86C80.4772 110 76 105.523 76 100V92Z" fill="url(#heroSea)" />

      {/* Share bar */}
      <rect x="76" y="122" width="84" height="14" rx="7" fill="#EEF7F9" />
      <rect x="84" y="127.5" width="46" height="3" rx="1.5" fill="#3297A3" fillOpacity="0.7" />
      <rect x="166" y="122" width="38" height="14" rx="7" fill="#3297A3" />
      <path d="M180 129H190M190 129L187 126M190 129L187 132" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Floating Reward Coin */}
      <circle cx="222" cy="46" r="20" fill="url(#heroCoin)" stroke="#FFFFFF" strokeWidth="3" />
      <text x="222" y="52" textAnchor="middle" fill="#FFFFFF" fontSize="17" fontWeight="800" fontFamily="sans-serif">
        $
      </text>

      {/* Floating Link Pill */}
      <rect x="26" y="76" width="48" height="30" rx="15" fill="#FFFFFF" stroke="#3297A3" strokeOpacity="0.28" strokeWidth="1.5" />
      <path
        d="M45 91H55M47 87.5H44C42.067 87.5 40.5 89.067 40.5 91C40.5 92.933 42.067 94.5 44 94.5H47M53 87.5H56C57.933 87.5 59.5 89.067 59.5 91C59.5 92.933 57.933 94.5 56 94.5H53"
        stroke="#3297A3"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface FormFieldErrors {
  websiteUrl?: string;
  promotionChannels?: string;
  payoutMethod?: string;
}

export function AffiliateProgramLanding() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const isIneligibleRole =
    user?.role === "agent" || user?.role === "staff" || user?.role === "admin";

  const { data: profileRes, isLoading: profileLoading } = useGetMyAffiliateProfileQuery(undefined, {
    skip: !isAuthenticated || isIneligibleRole,
  });
  const profile = profileRes?.data ?? null;

  const [applyAsAffiliate, { isLoading: isApplying }] = useApplyAsAffiliateMutation();
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [promotionChannels, setPromotionChannels] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState<string>("Bank Transfer");
  const [fieldErrors, setFieldErrors] = React.useState<FormFieldErrors>({});
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const backHref = isAuthenticated ? getDashboardHomeForRole(user?.role) : "/";
  const backLabel = isAuthenticated ? "Back to Dashboard" : "Back to Home";

  const validateForm = (): boolean => {
    const errors: FormFieldErrors = {};
    const trimmedUrl = websiteUrl.trim();
    if (trimmedUrl) {
      try {
        const parsed = new URL(trimmedUrl);
        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
          errors.websiteUrl = "Please enter a valid http:// or https:// URL.";
        }
      } catch {
        errors.websiteUrl = "Please enter a valid website URL (e.g. https://yourwebsite.com).";
      }
    }

    const trimmedChannels = promotionChannels.trim();
    if (trimmedChannels.length < 10) {
      errors.promotionChannels = "Please describe your promotion channels (at least 10 characters).";
    } else if (trimmedChannels.length > 1000) {
      errors.promotionChannels = "Description cannot exceed 1000 characters.";
    }

    if (!payoutMethod.trim()) {
      errors.payoutMethod = "Please select a preferred manual payout method.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isApplying) return;
    setFeedback(null);

    if (!validateForm()) return;

    try {
      await applyAsAffiliate({
        websiteUrl: websiteUrl.trim() || undefined,
        promotionChannels: promotionChannels.trim(),
        payoutMethod: payoutMethod.trim(),
      }).unwrap();
      setFeedback({
        type: "success",
        text: "Your affiliate application has been submitted and is now pending Admin review.",
      });
    } catch (err: unknown) {
      const msg =
        (err as { data?: { message?: string } })?.data?.message ||
        "Unable to submit application. Please check your details and try again.";
      setFeedback({ type: "error", text: msg });
    }
  };

  return (
    <div className="w-full bg-[#F8FAFB] py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-10">
        {/* Top Back Navigation */}
        <div>
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5EAED] bg-white px-3.5 py-2 text-xs font-medium text-[#556972] shadow-2xs transition-colors hover:border-[#3297A3]/40 hover:text-[#18282A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3297A3]"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{backLabel}</span>
          </Link>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-[#3297A3]/20 bg-gradient-to-br from-[#EDF8FA] via-white to-[#F4FAFB] p-6 sm:p-10 shadow-xs">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-7">
              <Badge variant="secondary" className="bg-[#3297A3]/12 text-[#1E727C] border-transparent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider">
                PhuketTours Partner Program
              </Badge>
              <h1 className="font-outfit text-3xl sm:text-4xl font-bold text-[#18282A] tracking-tight leading-tight">
                Earn Commission Sharing Phuket&apos;s Best Island Tours
              </h1>
              <p className="max-w-2xl text-sm sm:text-base text-[#556972] leading-relaxed">
                Join the PhuketTours Affiliate Program. Share unique tour referral links with your
                audience and earn commission on eligible verified customer bookings.
              </p>

              {/* Supporting Highlights */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "Unique referral links",
                  "30-day last-click attribution",
                  "Commission on verified payments",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#3297A3]/20 bg-white px-3 py-1 text-xs font-medium text-[#263238]"
                  >
                    <Sparkles className="h-3 w-3 text-[#3297A3]" aria-hidden="true" />
                    {item}
                  </span>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link href="/sign-up?redirect=%2Faffiliate">
                    <Button size="lg" className="bg-[#3297A3] hover:bg-[#287D87] text-white">
                      Create Account &amp; Apply
                      <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                  <Link href="/sign-in?redirect=%2Faffiliate">
                    <Button size="lg" variant="outline">
                      Sign In to Apply
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:col-span-5">
              <HeroPartnerIllustration />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="space-y-4">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="font-outfit text-xl sm:text-2xl font-bold text-[#18282A]">
              How the Affiliate Program Works
            </h2>
            <p className="mt-1 text-sm text-[#556972]">
              Start earning in four simple, transparent steps.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              step="01"
              icon={<Share2 className="h-4 w-4 text-[#3297A3]" />}
              title="Apply"
              description="Sign in with your PhuketTours account and submit a quick affiliate application."
            />
            <StepCard
              step="02"
              icon={<Link2 className="h-4 w-4 text-[#3297A3]" />}
              title="Share Links"
              description="Generate general or tour-specific referral links once approved by our Admin team."
            />
            <StepCard
              step="03"
              icon={<Percent className="h-4 w-4 text-[#3297A3]" />}
              title="Earn Commission"
              description="Earn commission on verified customer payments with 30-day last-click attribution."
            />
            <StepCard
              step="04"
              icon={<Wallet className="h-4 w-4 text-[#3297A3]" />}
              title="Request Payout"
              description="Submit payout requests from your available balance for manual payout processing."
            />
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-[#E5EAED]" />

        {/* Authenticated Application / Status Panel */}
        {isAuthenticated && (
          <section id="apply">
            {isIneligibleRole ? (
              <Card className="mx-auto max-w-3xl border-[#E5EAED] bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#18282A]">
                    <AlertCircle className="h-5 w-5 text-[#3297A3]" />
                    Affiliate Program Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-[#556972]">
                  <p>
                    Only standard Customer accounts are eligible to apply for the PhuketTours
                    Affiliate Program. Agent, Staff, and Admin accounts cannot apply or access
                    Affiliate earning features.
                  </p>
                  <Link href={backHref}>
                    <Button variant="outline" size="sm">
                      <ArrowLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Return to Your Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : profileLoading ? (
              <Card className="mx-auto max-w-3xl">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Checking your affiliate status...
                </CardContent>
              </Card>
            ) : profile?.status === "APPROVED" ? (
              <Card className="mx-auto max-w-3xl border-emerald-200 bg-emerald-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-900">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    You Are an Approved PhuketTours Affiliate
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-emerald-900">
                    Referral Code: <code className="font-mono font-bold">{profile.code}</code> ·
                    Active Rate: <strong>{profile.effectiveCommissionRate}%</strong>
                  </p>
                  <Link href="/dashboard/affiliate">
                    <Button className="bg-[#3297A3] hover:bg-[#287D87] text-white">
                      Open Affiliate Dashboard
                      <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : profile?.status === "PENDING" ? (
              <Card className="mx-auto max-w-3xl border-amber-200 bg-amber-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <Clock className="h-5 w-5 text-amber-600" />
                    Application Pending Admin Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-amber-900">
                  <p>
                    Thank you for applying, <strong>{user?.name}</strong>. Your affiliate application is
                    currently awaiting Admin approval.
                  </p>
                  <p>
                    Reserved Referral Code: <code className="font-mono font-semibold">{profile.code}</code>
                  </p>
                </CardContent>
              </Card>
            ) : profile?.status === "SUSPENDED" ? (
              <Card className="mx-auto max-w-3xl border-red-200 bg-red-50/40">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-900">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Affiliate Account Suspended
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-red-900">
                  Your affiliate account is currently suspended and cannot generate new commissions or
                  request payouts. Please contact PhuketTours support.
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden border-[#E5EAED] bg-white shadow-xs">
                <div className="grid lg:grid-cols-12">
                  {/* Left Intro Column */}
                  <div className="bg-gradient-to-b from-[#F2FAFB] to-[#F8FCFD] p-6 sm:p-8 lg:col-span-5 lg:border-r lg:border-[#E5EAED] flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#3297A3]">
                        Partner Application
                      </span>
                      <h2 className="font-outfit text-2xl font-bold text-[#18282A] tracking-tight">
                        Apply to Become an Affiliate
                      </h2>
                      <p className="text-sm text-[#556972] leading-relaxed">
                        Tell us how you plan to promote PhuketTours. Our team will review your
                        application and notify you once approved.
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-[#263238]">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3297A3]" />
                        <span>Track clicks, referred bookings, and commissions in real time</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3297A3]" />
                        <span>30-day last-click attribution on verified customer payments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#3297A3]" />
                        <span>Transparent manual payouts via Bank Transfer, Wise, or PayPal</span>
                      </li>
                    </ul>
                  </div>

                  {/* Right Form Column */}
                  <div className="p-6 sm:p-8 lg:col-span-7">
                    {profile?.status === "REJECTED" && (
                      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800">
                        <strong>Previous application rejected:</strong>{" "}
                        {profile.rejectionReason || "No reason provided."} You may update your
                        details and re-apply below.
                      </div>
                    )}

                    <form onSubmit={handleApply} noValidate className="space-y-5">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="affiliate-website-url"
                          className="block text-sm font-medium text-[#18282A]"
                        >
                          Website / Blog / Social Profile URL{" "}
                          <span className="text-xs font-normal text-[#74818A]">(Optional)</span>
                        </label>
                        <Input
                          id="affiliate-website-url"
                          type="url"
                          value={websiteUrl}
                          onChange={(e) => {
                            setWebsiteUrl(e.target.value);
                            if (fieldErrors.websiteUrl) {
                              setFieldErrors((prev) => ({ ...prev, websiteUrl: undefined }));
                            }
                          }}
                          placeholder="https://yourwebsite.com"
                          className="h-10 w-full"
                        />
                        {fieldErrors.websiteUrl ? (
                          <p className="text-xs text-red-600">{fieldErrors.websiteUrl}</p>
                        ) : (
                          <p className="text-xs text-[#74818A]">
                            Share your primary travel blog, YouTube channel, or social profile.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="affiliate-promotion-channels"
                          className="block text-sm font-medium text-[#18282A]"
                        >
                          How will you promote PhuketTours?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="affiliate-promotion-channels"
                          rows={4}
                          required
                          maxLength={1000}
                          value={promotionChannels}
                          onChange={(e) => {
                            setPromotionChannels(e.target.value);
                            if (fieldErrors.promotionChannels) {
                              setFieldErrors((prev) => ({ ...prev, promotionChannels: undefined }));
                            }
                          }}
                          placeholder="Describe your travel blog, YouTube channel, Instagram audience, newsletter, or other promotion channels."
                          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-[#18282A] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3297A3]"
                        />
                        <div className="flex items-center justify-between gap-2">
                          {fieldErrors.promotionChannels ? (
                            <p className="text-xs text-red-600">{fieldErrors.promotionChannels}</p>
                          ) : (
                            <p className="text-xs text-[#74818A]">
                              Examples: Travel blog, YouTube, Instagram, TikTok, Newsletter.
                            </p>
                          )}
                          <span className="text-[11px] text-[#74818A] shrink-0">
                            {promotionChannels.length}/1000
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="affiliate-payout-method"
                          className="block text-sm font-medium text-[#18282A]"
                        >
                          Preferred Manual Payout Method{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="affiliate-payout-method"
                          value={payoutMethod}
                          onChange={(e) => {
                            setPayoutMethod(e.target.value);
                            if (fieldErrors.payoutMethod) {
                              setFieldErrors((prev) => ({ ...prev, payoutMethod: undefined }));
                            }
                          }}
                          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-[#18282A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3297A3]"
                        >
                          {PAYOUT_METHODS.map((method) => (
                            <option key={method} value={method}>
                              {method}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.payoutMethod && (
                          <p className="text-xs text-red-600">{fieldErrors.payoutMethod}</p>
                        )}
                      </div>

                      {feedback && (
                        <div
                          className={
                            feedback.type === "error"
                              ? "rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
                              : "rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800"
                          }
                        >
                          {feedback.text}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={isApplying}
                        className="h-11 w-full bg-[#3297A3] hover:bg-[#287D87] text-white font-semibold"
                      >
                        {isApplying ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                            Submitting Application...
                          </>
                        ) : (
                          <>
                            Submit Affiliate Application
                            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function StepCard({
  step,
  icon,
  title,
  description,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full border-[#E5EAED] bg-white transition-all hover:border-[#3297A3]/40 hover:shadow-xs">
      <CardHeader className="pb-2">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#3297A3]/10">
            {icon}
          </div>
          <span className="font-outfit text-xs font-bold text-[#96A4AB]">{step}</span>
        </div>
        <CardTitle className="font-outfit text-base font-bold text-[#18282A]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-[#556972] leading-relaxed">{description}</CardContent>
    </Card>
  );
}
