"use client";

import * as React from "react";
import {
  useGetMyAffiliateDashboardQuery,
  useGetMyAffiliatePayoutsQuery,
  useRequestAffiliatePayoutMutation,
} from "../api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AffiliatePayoutsView() {
  const { data: dashRes } = useGetMyAffiliateDashboardQuery();
  const { data: payoutsRes, isLoading, isError } = useGetMyAffiliatePayoutsQuery();
  const [requestPayout, { isLoading: isSubmitting }] = useRequestAffiliatePayoutMutation();

  const [amount, setAmount] = React.useState("");
  const [payoutMethod, setPayoutMethod] = React.useState("Bank Transfer");
  const [message, setMessage] = React.useState<string | null>(null);

  const availableBalance = payoutsRes?.data?.balances?.availableBalance ?? dashRes?.data?.availableBalance ?? 0;
  const minPayout = dashRes?.data?.minimumPayoutAmount ?? 50;
  const payouts = payoutsRes?.data?.items ?? [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setMessage("Please enter a valid payout amount.");
      return;
    }
    try {
      await requestPayout({ amount: parsed, payoutMethod }).unwrap();
      setAmount("");
      setMessage("Payout request submitted for Admin review.");
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message || "Failed to submit payout request.";
      setMessage(msg);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payout Requests</h1>
        <p className="text-sm text-muted-foreground">
          Available Balance: <strong className="text-foreground">THB {availableBalance.toFixed(2)}</strong> ·
          Minimum Payout: <strong>THB {minPayout.toFixed(2)}</strong>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Manual Payout</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
            <div className="w-48">
              <label className="text-xs font-medium text-muted-foreground">Amount (THB)</label>
              <Input
                type="number"
                step="0.01"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
              />
            </div>
            <div className="min-w-[200px] flex-1">
              <label className="text-xs font-medium text-muted-foreground">Payout Method</label>
              <Input
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                placeholder="Bank Transfer / PayPal / Wise"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Payout Request"}
            </Button>
          </form>
          {message && <p className="mt-3 text-sm text-teal-700">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-muted-foreground">Loading payouts...</p>}
          {isError && <p className="text-sm text-red-600">Failed to load payout history.</p>}
          {!isLoading && !isError && payouts.length === 0 && (
            <p className="text-sm text-muted-foreground">No payout requests yet.</p>
          )}
          {payouts.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Date</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Method</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Reference / Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">{new Date(p.requestedAt).toLocaleDateString()}</td>
                      <td className="py-2 pr-4 font-medium">
                        {p.currency} {Number(p.amount).toFixed(2)}
                      </td>
                      <td className="py-2 pr-4">{p.payoutMethod}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={p.status === "REJECTED" ? "outline" : "secondary"}>{p.status}</Badge>
                      </td>
                      <td className="py-2 text-xs text-muted-foreground">
                        {p.transactionReference
                          ? `Ref: ${p.transactionReference}`
                          : p.rejectionReason
                          ? `Rejected: ${p.rejectionReason}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
