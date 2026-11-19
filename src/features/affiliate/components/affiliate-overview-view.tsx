"use client";

import * as React from "react";
import {
  useApplyAsAffiliateMutation,
  useGetMyAffiliateDashboardQuery,
  useGetMyAffiliateProfileQuery,
} from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AffiliateOverviewView() {
  const { data: profileRes, isLoading: profileLoading } = useGetMyAffiliateProfileQuery();
  const profile = profileRes?.data ?? null;

  const {
    data: dashboardRes,
    isLoading: dashLoading,
    isError: dashError,
  } = useGetMyAffiliateDashboardQuery(undefined, {
    skip: !profile || profile.status !== "APPROVED",
  });

  const [applyAsAffiliate, { isLoading: isApplying }] = useApplyAsAffiliateMutation();
  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [promotionChannels, setPromotionChannels] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState("Bank Transfer");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await applyAsAffiliate({ websiteUrl, promotionChannels, payoutMethod }).unwrap();
      setFeedback("Your affiliate application has been submitted for Admin review.");
    } catch {
      setFeedback("Failed to submit affiliate application. Please try again.");
    }
  };

  if (profileLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading affiliate profile...</div>;
  }

  if (!profile || profile.status === "REJECTED") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Join the PhuketTours Affiliate Program</h1>
          <p className="text-sm text-muted-foreground">
            Earn commissions by referring customers to verified PhuketTours experiences.
          </p>
        </div>

        {profile?.status === "REJECTED" && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6 text-sm text-red-800">
              <strong>Previous application rejected:</strong>{" "}
              {profile.rejectionReason || "No reason provided."} You may update your details and re-apply below.
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Affiliate Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-4 max-w-lg">
              <div>
                <label className="text-sm font-medium">Website / Blog / Social URL</label>
                <Input
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourtravelblog.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Promotion Channels</label>
                <Input
                  value={promotionChannels}
                  onChange={(e) => setPromotionChannels(e.target.value)}
                  placeholder="YouTube, Instagram, Travel Blog, Newsletter"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Preferred Payout Method</label>
                <Input
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  placeholder="Bank Transfer / PayPal / Wise"
                />
              </div>
              {feedback && <p className="text-sm text-teal-700">{feedback}</p>}
              <Button type="submit" disabled={isApplying}>
                {isApplying ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profile.status === "PENDING") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Affiliate Application Pending
            <Badge variant="secondary">PENDING</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Your application is currently under review by our Admin team.</p>
          <p>
            Reserved Referral Code: <code className="font-mono font-semibold text-foreground">{profile.code}</code>
          </p>
        </CardContent>
      </Card>
    );
  }

  if (profile.status === "SUSPENDED") {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Affiliate Account Suspended
            <Badge variant="outline">SUSPENDED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900">
          Your affiliate account is currently suspended. New clicks and bookings will not generate commissions. Please contact Admin support.
        </CardContent>
      </Card>
    );
  }

  const summary = dashboardRes?.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate Overview</h1>
          <p className="text-sm text-muted-foreground">
            Referral Code: <code className="font-mono font-semibold text-foreground">{profile.code}</code> ·
            Commission Rate: <strong>{profile.effectiveCommissionRate}%</strong>
          </p>
        </div>
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">APPROVED</Badge>
      </div>

      {dashLoading && <p className="text-sm text-muted-foreground">Loading performance metrics...</p>}
      {dashError && <p className="text-sm text-red-600">Failed to load dashboard summary.</p>}

      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Clicks" value={summary.totalClicks.toLocaleString()} />
          <StatCard label="Referred Bookings" value={summary.referredBookings.toLocaleString()} />
          <StatCard label="Conversion Rate" value={`${summary.conversionRate}%`} />
          <StatCard label="Total Earned" value={`THB ${summary.totalEarned.toFixed(2)}`} />
          <StatCard label="Pending Commission" value={`THB ${summary.pendingCommission.toFixed(2)}`} />
          <StatCard label="Available Balance" value={`THB ${summary.availableBalance.toFixed(2)}`} highlight />
          <StatCard label="Reserved for Payout" value={`THB ${summary.reservedForPayout.toFixed(2)}`} />
          <StatCard label="Paid Commission" value={`THB ${summary.paidCommission.toFixed(2)}`} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <Card className={highlight ? "border-teal-300 bg-teal-50/40" : undefined}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
