"use client";

import * as React from "react";
import Link from "next/link";
import { Share2, Link2, Percent, Wallet, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { selectCurrentUser, selectIsAuthenticated } from "@/features/auth/slices/auth-slice";
import {
  useApplyAsAffiliateMutation,
  useGetMyAffiliateProfileQuery,
} from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AffiliateProgramLanding() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectCurrentUser);

  const { data: profileRes, isLoading: profileLoading } = useGetMyAffiliateProfileQuery(undefined, {
    skip: !isAuthenticated,
  });
  const profile = profileRes?.data ?? null;

  const [applyAsAffiliate, { isLoading: isApplying }] = useApplyAsAffiliateMutation();
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [promotionChannels, setPromotionChannels] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState("Bank Transfer");
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await applyAsAffiliate({
        websiteUrl: websiteUrl.trim() || undefined,
        promotionChannels: promotionChannels.trim() || undefined,
        payoutMethod: payoutMethod.trim() || undefined,
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
    <div className="w-full bg-[#F8FAFB] py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-10">
        {/* Hero */}
        <section className="rounded-2xl border bg-white p-8 sm:p-10 shadow-xs text-center space-y-4">
          <Badge variant="secondary" className="mx-auto">
            PhuketTours Partner Program
          </Badge>
          <h1 className="font-outfit text-3xl sm:text-4xl font-bold text-[#18282A] tracking-tight">
            Earn Commission Sharing Phuket&apos;s Best Island Tours
          </h1>
          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#5E6D77]">
            Join the PhuketTours Affiliate Program. Share unique tour referral links with your audience
            and earn commission on every verified customer booking with 30-day last-click attribution.
          </p>
          {!isAuthenticated && (
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/sign-up?redirect=%2Faffiliate">
                <Button size="lg">Create Account &amp; Apply</Button>
              </Link>
              <Link href="/sign-in?redirect=%2Faffiliate">
                <Button size="lg" variant="outline">
                  Sign In to Apply
                </Button>
              </Link>
            </div>
          )}
        </section>

        {/* How It Works */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StepCard
            icon={<Share2 className="h-5 w-5 text-teal-600" />}
            title="1. Apply"
            description="Sign in with your PhuketTours account and submit a quick affiliate application."
          />
          <StepCard
            icon={<Link2 className="h-5 w-5 text-teal-600" />}
            title="2. Share Links"
            description="Generate general or tour-specific referral links once approved by our Admin team."
          />
          <StepCard
            icon={<Percent className="h-5 w-5 text-teal-600" />}
            title="3. Earn Commission"
            description="Earn commission on verified customer payments with 30-day last-click attribution."
          />
          <StepCard
            icon={<Wallet className="h-5 w-5 text-teal-600" />}
            title="4. Request Payout"
            description="Submit payout requests from your available balance for manual payout processing."
          />
        </section>

        {/* Authenticated Application / Status Panel */}
        {isAuthenticated && (
          <section id="apply">
            {profileLoading ? (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  Checking your affiliate status...
                </CardContent>
              </Card>
            ) : profile?.status === "APPROVED" ? (
              <Card className="border-emerald-200 bg-emerald-50/40">
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
                    <Button>Go to Affiliate Dashboard</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : profile?.status === "PENDING" ? (
              <Card className="border-amber-200 bg-amber-50/40">
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
              <Card className="border-red-200 bg-red-50/40">
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
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Become an Affiliate</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {profile?.status === "REJECTED" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                      <strong>Previous application rejected:</strong>{" "}
                      {profile.rejectionReason || "No reason provided."} You may update your details and re-apply below.
                    </div>
                  )}

                  <form onSubmit={handleApply} className="space-y-4 max-w-xl">
                    <div>
                      <label className="text-sm font-medium">Website / Blog / Social Profile URL</label>
                      <Input
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://yourtravelblog.com"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">How will you promote PhuketTours?</label>
                      <Input
                        value={promotionChannels}
                        onChange={(e) => setPromotionChannels(e.target.value)}
                        placeholder="Travel blog, YouTube, Instagram, Newsletter"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Preferred Manual Payout Method</label>
                      <Input
                        value={payoutMethod}
                        onChange={(e) => setPayoutMethod(e.target.value)}
                        placeholder="Bank Transfer / Wise / PayPal"
                      />
                    </div>

                    {feedback && (
                      <p
                        className={
                          feedback.type === "error"
                            ? "text-sm text-red-600"
                            : "text-sm text-emerald-700"
                        }
                      >
                        {feedback.text}
                      </p>
                    )}

                    <Button type="submit" disabled={isApplying}>
                      {isApplying ? "Submitting Application..." : "Apply Now"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function StepCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground leading-relaxed">{description}</CardContent>
    </Card>
  );
}
