"use client";

import * as React from "react";
import {
  useApproveAdminAffiliateMutation,
  useApproveAdminAffiliatePayoutMutation,
  useGetAdminAffiliateAuditEventsQuery,
  useGetAdminAffiliateBookingsQuery,
  useGetAdminAffiliateCommissionsQuery,
  useGetAdminAffiliateOverviewQuery,
  useGetAdminAffiliatePayoutsQuery,
  useGetAdminAffiliateSettingsQuery,
  useGetAdminAffiliatesQuery,
  useMarkAdminAffiliatePayoutPaidMutation,
  useReactivateAdminAffiliateMutation,
  useRejectAdminAffiliateMutation,
  useRejectAdminAffiliatePayoutMutation,
  useSetAdminAffiliateCommissionRateMutation,
  useSuspendAdminAffiliateMutation,
  useUpdateAdminAffiliateSettingsMutation,
} from "@/features/affiliate/api/affiliate-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function AdminAffiliateOverviewView() {
  const { data, isLoading, isError } = useGetAdminAffiliateOverviewQuery();
  const overview = data?.data;

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading affiliate overview...</div>;
  if (isError || !overview) return <div className="p-6 text-sm text-red-600">Failed to load affiliate overview.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Affiliate Overview</h1>
        <p className="text-sm text-muted-foreground">
          Global Rate: <strong>{Number(overview.settings.globalCommissionRate)}%</strong> ·
          Attribution Window: <strong>{overview.settings.attributionWindowDays} days</strong>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Affiliates" value={String(overview.totalAffiliates)} />
        <MetricCard label="Pending Applications" value={String(overview.pendingApplications)} />
        <MetricCard label="Approved Affiliates" value={String(overview.approvedAffiliates)} />
        <MetricCard label="Total Clicks" value={overview.totalClicks.toLocaleString()} />
        <MetricCard label="Attributed Bookings" value={overview.totalAttributedBookings.toLocaleString()} />
        <MetricCard label="Net Commissions" value={`THB ${overview.totalNetCommissions.toFixed(2)}`} />
        <MetricCard
          label="Pending Payouts"
          value={`${overview.pendingPayoutsCount} (THB ${overview.pendingPayoutsAmount.toFixed(2)})`}
        />
        <MetricCard label="Total Paid Out" value={`THB ${overview.totalPaidOut.toFixed(2)}`} />
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export function AdminAffiliatesListView({ fixedStatus }: { fixedStatus?: "PENDING" }) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState(fixedStatus ?? "");
  const [rateOverrides, setRateOverrides] = React.useState<Record<string, string>>({});

  const { data, isLoading, isError } = useGetAdminAffiliatesQuery({
    status: (fixedStatus ?? statusFilter) || undefined,
    search: search || undefined,
  });

  const [approve] = useApproveAdminAffiliateMutation();
  const [reject] = useRejectAdminAffiliateMutation();
  const [suspend] = useSuspendAdminAffiliateMutation();
  const [reactivate] = useReactivateAdminAffiliateMutation();
  const [setCommissionRate] = useSetAdminAffiliateCommissionRateMutation();

  const items = data?.data?.items ?? [];

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter rejection reason (required):");
    if (!reason || reason.trim().length < 3) return;
    await reject({ id, reason: reason.trim() });
  };

  const handleSaveRate = async (id: string) => {
    const raw = rateOverrides[id];
    const value = raw === "" || raw === undefined ? null : Number(raw);
    if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) return;
    await setCommissionRate({ id, commissionRateOverride: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">
          {fixedStatus === "PENDING" ? "Affiliate Applications" : "All Affiliates"}
        </h1>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search name, email, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          {!fixedStatus && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading && <p className="text-sm text-muted-foreground">Loading affiliates...</p>}
          {isError && <p className="text-sm text-red-600">Failed to load affiliates.</p>}
          {!isLoading && !isError && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No affiliates found.</p>
          )}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-muted-foreground">
                    <th className="py-2 pr-4">Affiliate</th>
                    <th className="py-2 pr-4">Code</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Clicks / Bookings</th>
                    <th className="py-2 pr-4">Rate Override (%)</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((aff) => (
                    <tr key={aff.id} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{aff.user.name}</div>
                        <div className="text-xs text-muted-foreground">{aff.user.email}</div>
                      </td>
                      <td className="py-2 pr-4 font-mono text-xs">{aff.code}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={aff.status === "REJECTED" || aff.status === "SUSPENDED" ? "outline" : "secondary"}>
                          {aff.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {aff._count.clicks} clicks · {aff._count.attributions} bookings
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-1">
                          <Input
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            className="h-8 w-20 text-xs"
                            placeholder="Global"
                            value={
                              rateOverrides[aff.id] ??
                              (aff.commissionRateOverride !== null ? String(aff.commissionRateOverride) : "")
                            }
                            onChange={(e) =>
                              setRateOverrides((prev) => ({ ...prev, [aff.id]: e.target.value }))
                            }
                          />
                          <Button size="sm" variant="outline" onClick={() => handleSaveRate(aff.id)}>
                            Save
                          </Button>
                        </div>
                      </td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          {aff.status === "PENDING" && (
                            <>
                              <Button size="sm" onClick={() => approve(aff.id)}>
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(aff.id)}>
                                Reject
                              </Button>
                            </>
                          )}
                          {aff.status === "APPROVED" && (
                            <Button size="sm" variant="outline" onClick={() => suspend({ id: aff.id })}>
                              Suspend
                            </Button>
                          )}
                          {aff.status === "SUSPENDED" && (
                            <Button size="sm" onClick={() => reactivate(aff.id)}>
                              Reactivate
                            </Button>
                          )}
                        </div>
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

export function AdminAffiliateSettingsView() {
  const { data, isLoading } = useGetAdminAffiliateSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateAdminAffiliateSettingsMutation();
  const settings = data?.data;

  const [globalRate, setGlobalRate] = React.useState("10");
  const [windowDays, setWindowDays] = React.useState("30");
  const [minPayout, setMinPayout] = React.useState("50");
  const [policy, setPolicy] = React.useState<"NET_AFTER_DISCOUNTS" | "GROSS">("NET_AFTER_DISCOUNTS");
  const [isActive, setIsActive] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    if (!settings) return;
    setGlobalRate(String(settings.globalCommissionRate));
    setWindowDays(String(settings.attributionWindowDays));
    setMinPayout(String(settings.minimumPayoutAmount));
    setPolicy(settings.eligibleAmountPolicy);
    setIsActive(settings.isProgramActive);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    await updateSettings({
      globalCommissionRate: Number(globalRate),
      attributionWindowDays: Number(windowDays),
      minimumPayoutAmount: Number(minPayout),
      eligibleAmountPolicy: policy,
      isProgramActive: isActive,
    });
    setSaved(true);
  };

  if (isLoading) return <div className="p-6 text-sm text-muted-foreground">Loading affiliate settings...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Commission & Program Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4 max-w-lg">
          <div>
            <label className="text-sm font-medium">Global Commission Rate (%)</label>
            <Input type="number" step="0.1" min={0} max={100} value={globalRate} onChange={(e) => setGlobalRate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Attribution Window (Days)</label>
            <Input type="number" min={1} max={365} value={windowDays} onChange={(e) => setWindowDays(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Minimum Payout Threshold (THB)</label>
            <Input type="number" step="0.01" min={0} value={minPayout} onChange={(e) => setMinPayout(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Eligible Commission Amount Policy</label>
            <select
              value={policy}
              onChange={(e) => setPolicy(e.target.value as "NET_AFTER_DISCOUNTS" | "GROSS")}
              className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="NET_AFTER_DISCOUNTS">Net Paid Amount After Discounts (Recommended)</option>
              <option value="GROSS">Gross Base Price</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Affiliate Program Active
          </label>
          {saved && <p className="text-sm text-teal-700">Settings updated. Historical commission records remain unchanged.</p>}
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function AdminAffiliatePayoutsView() {
  const { data, isLoading, isError } = useGetAdminAffiliatePayoutsQuery();
  const [approve] = useApproveAdminAffiliatePayoutMutation();
  const [reject] = useRejectAdminAffiliatePayoutMutation();
  const [markPaid] = useMarkAdminAffiliatePayoutPaidMutation();

  const items = data?.data?.items ?? [];

  const handleReject = async (id: string) => {
    const reason = window.prompt("Enter payout rejection reason (required):");
    if (!reason || reason.trim().length < 3) return;
    await reject({ id, reason: reason.trim() });
  };

  const handleMarkPaid = async (id: string, defaultMethod: string) => {
    const reference = window.prompt("Enter manual payment transaction/reference ID:");
    if (!reference || reference.trim().length < 2) return;
    await markPaid({ id, payoutMethod: defaultMethod, transactionReference: reference.trim() });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Payout Requests</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading payout requests...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load payout requests.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No payout requests found.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Affiliate</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Method</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Reference / Reason</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <div className="font-medium">{p.affiliate?.user.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{p.affiliate?.code}</div>
                    </td>
                    <td className="py-2 pr-4 font-semibold">
                      {p.currency} {Number(p.amount).toFixed(2)}
                    </td>
                    <td className="py-2 pr-4">{p.payoutMethod}</td>
                    <td className="py-2 pr-4">
                      <Badge variant={p.status === "REJECTED" ? "outline" : "secondary"}>{p.status}</Badge>
                    </td>
                    <td className="py-2 pr-4 text-xs text-muted-foreground">
                      {p.transactionReference || p.rejectionReason || "—"}
                    </td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-1">
                        {p.status === "PENDING" && (
                          <Button size="sm" variant="outline" onClick={() => approve(p.id)}>
                            Approve
                          </Button>
                        )}
                        {(p.status === "PENDING" || p.status === "APPROVED") && (
                          <>
                            <Button size="sm" onClick={() => handleMarkPaid(p.id, p.payoutMethod)}>
                              Mark Paid
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleReject(p.id)}>
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
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

export function AdminAffiliateBookingsView() {
  const { data, isLoading, isError } = useGetAdminAffiliateBookingsQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attributed Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading attributed bookings...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load bookings.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No attributed bookings yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Affiliate</th>
                  <th className="py-2 pr-4">Booking</th>
                  <th className="py-2 pr-4">Tour</th>
                  <th className="py-2 pr-4">Final Price</th>
                  <th className="py-2">Payment Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs">{b.referralCode}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{b.bookingId.slice(0, 8)}...</td>
                    <td className="py-2 pr-4">{b.booking?.service?.name || "Tour"}</td>
                    <td className="py-2 pr-4">
                      {b.booking?.currency} {Number(b.booking?.finalPrice ?? 0).toFixed(2)}
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

export function AdminAffiliateCommissionsView() {
  const { data, isLoading, isError } = useGetAdminAffiliateCommissionsQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Commission Ledger</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading commission ledger...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load commission ledger.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No commission entries yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Affiliate</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Eligible</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{c.affiliate?.code}</td>
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

export function AdminAffiliateReportsView() {
  const { data, isLoading, isError } = useGetAdminAffiliateAuditEventsQuery();
  const items = data?.data?.items ?? [];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Affiliate Audit History & Reports</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Loading audit history...</p>}
        {isError && <p className="text-sm text-red-600">Failed to load audit events.</p>}
        {!isLoading && !isError && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No audit events recorded yet.</p>
        )}
        {items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Timestamp</th>
                  <th className="py-2 pr-4">Entity</th>
                  <th className="py-2 pr-4">Action</th>
                  <th className="py-2 pr-4">Affiliate</th>
                  <th className="py-2">Actor</th>
                </tr>
              </thead>
              <tbody>
                {items.map((ev) => (
                  <tr key={ev.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-xs">{new Date(ev.createdAt).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-xs font-medium">{ev.entityType}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{ev.action}</td>
                    <td className="py-2 pr-4 font-mono text-xs">{ev.affiliate?.code || "—"}</td>
                    <td className="py-2 text-xs text-muted-foreground">{ev.actor?.name || ev.actorRole || "System"}</td>
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
