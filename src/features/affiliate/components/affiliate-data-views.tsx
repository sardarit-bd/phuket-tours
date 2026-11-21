"use client";

import * as React from "react";
import {
  useGetMyAffiliateBookingsQuery,
  useGetMyAffiliateClicksQuery,
  useGetMyAffiliateCommissionsQuery,
  useGetMyAffiliateProfileQuery,
  useUpdateMyAffiliateProfileMutation,
} from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AffiliateClicksView() {
  const { data, isLoading, isError } = useGetMyAffiliateClicksQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Click Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading clicks...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load click analytics.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No referral clicks recorded yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Landing URL</th>
                  <th className="py-2 pr-4">Referrer</th>
                  <th className="py-2">Attribution Expires</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(c.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{c.landingUrl}</td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">{c.referrer || "Direct"}</td>
                    <td className="py-2 text-xs">{new Date(c.expiresAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AffiliateBookingsView() {
  const { data, isLoading, isError } = useGetMyAffiliateBookingsQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Referred Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading referred bookings...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load referred bookings.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No referred bookings yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Booking ID</th>
                  <th className="py-2 pr-4">Tour</th>
                  <th className="py-2 pr-4">Final Price</th>
                  <th className="py-2 pr-4">Booking Status</th>
                  <th className="py-2">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{b.bookingId.slice(0, 8)}...</td>
                    <td className="py-2 pr-4">{b.booking?.service?.name || "Tour"}</td>
                    <td className="py-2 pr-4">
                      {b.booking?.currency} {Number(b.booking?.finalPrice ?? 0).toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">
                      <Badge variant="secondary">{b.booking?.status}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge variant="outline">{b.booking?.paymentStatus}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AffiliateCommissionsView() {
  const { data, isLoading, isError } = useGetMyAffiliateCommissionsQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Commission History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading commissions...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load commission history.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No commissions recorded yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Booking</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Eligible</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Commission</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{c.bookingId.slice(0, 8)}...</td>
                    <td className="py-2 pr-4">{c.entryType}</td>
                    <td className="py-2 pr-4">
                      {c.currency} {Number(c.eligibleAmount).toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">{Number(c.commissionRate)}%</td>
                    <td className="py-2 pr-4 font-semibold">
                      {c.currency} {Number(c.amount).toFixed(2)}
                    </td>
                    <td className="py-2">
                      <Badge variant={c.status === "REVERSED" ? "outline" : "secondary"}>{c.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AffiliateProfileSettingsView({ mode = "profile" }: { mode?: "profile" | "payment" }) {
  const { data: profileRes, isLoading } = useGetMyAffiliateProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyAffiliateProfileMutation();
  const profile = profileRes?.data;

  const [websiteUrl, setWebsiteUrl] = React.useState("");
  const [promotionChannels, setPromotionChannels] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState("");
  const [accountInfo, setAccountInfo] = React.useState("");
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;
    setWebsiteUrl(profile.websiteUrl ?? "");
    setPromotionChannels(profile.promotionChannels ?? "");
    setPayoutMethod(profile.payoutMethod ?? "");
    setAccountInfo(String((profile.payoutDetails as { accountInfo?: string } | null)?.accountInfo ?? ""));
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await updateProfile({
      websiteUrl,
      promotionChannels,
      payoutMethod,
      payoutDetails: { accountInfo },
    });
    setSaved(true);
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading settings...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "payment" ? "Payment Details" : "Affiliate Profile & Settings"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          {mode === "profile" && (
            <>
              <div>
                <label className="text-sm font-medium">Website URL</label>
                <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Promotion Channels</label>
                <Input value={promotionChannels} onChange={(e) => setPromotionChannels(e.target.value)} />
              </div>
            </>
          )}
          <div>
            <label className="text-sm font-medium">Payout Method</label>
            <Input value={payoutMethod} onChange={(e) => setPayoutMethod(e.target.value)} placeholder="Bank Transfer / Wise / PayPal" />
          </div>
          <div>
            <label className="text-sm font-medium">Account / Beneficiary Details</label>
            <Input value={accountInfo} onChange={(e) => setAccountInfo(e.target.value)} placeholder="Account number / PayPal email / IBAN" />
          </div>
          {saved && <p className="text-sm text-teal-700">Changes saved.</p>}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
