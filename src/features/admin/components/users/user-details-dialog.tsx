"use client";

import * as React from "react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserRoleBadge } from "./user-role-badge";
import { UserStatusBadge } from "./user-status-badge";
import { useGetAdminAgentByIdQuery, useGetAdminUserByIdQuery } from "../../api/admin-api";
import type { AdminUserRecord } from "../../types/admin-users";
import {
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  Clock,
  Loader2,
  AlertCircle,
  TrendingUp,
  Coins,
  Briefcase,
} from "lucide-react";

export interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUserRecord | null;
  onEditClick?: (user: AdminUserRecord) => void;
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "N/A";
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function UserDetailsDialog({
  isOpen,
  onClose,
  user,
  onEditClick,
}: UserDetailsDialogProps) {
  if (!user) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="User Account Details"
      description={`Detailed record for ${user.name}`}
      size="md"
    >
      <UserDetailsContent
        user={user}
        onClose={onClose}
        onEditClick={onEditClick}
      />
    </Dialog>
  );
}

function UserDetailsContent({
  user,
  onClose,
  onEditClick,
}: {
  user: AdminUserRecord;
  onClose: () => void;
  onEditClick?: (user: AdminUserRecord) => void;
}) {
  // Fetch fresh detailed record from GET /admin/users/:userId
  const {
    data: userResponse,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetAdminUserByIdQuery(user.id);

  const currentUser: AdminUserRecord = userResponse?.data || user;

  // If role is agent, also fetch agent profile and business overview from GET /admin/agents/:agentId
  const isAgent = currentUser.role === "agent";
  const {
    data: agentResponse,
    isLoading: isAgentLoading,
  } = useGetAdminAgentByIdQuery(user.id, {
    skip: !isAgent,
  });

  const agentUser = agentResponse?.data;
  const agentProfile = agentUser?.agentProfile || currentUser.agentProfile;
  const businessOverview = agentUser?.businessOverview;

  return (
    <div className="space-y-5 pt-1" data-testid="user-details-dialog-content">
      {isUserLoading && (
        <div className="flex items-center justify-center py-6 text-xs text-[#74818A]">
          <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#176779]" />
          Refreshing user details...
        </div>
      )}

      {isUserError && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
          <span>Showing cached user details. Fresh fetch encountered an issue.</span>
        </div>
      )}

      {/* Header Profile Summary */}
      <div className="flex items-start gap-4 rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#176779] text-lg font-bold text-white shadow-xs">
          {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-outfit text-base font-bold text-[#18282A] truncate">
              {currentUser.name}
            </h4>
            <UserRoleBadge role={currentUser.role} />
            <UserStatusBadge status={currentUser.status} />
          </div>
          <p className="mt-1 text-xs text-[#74818A] flex items-center gap-1.5 truncate">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            {currentUser.email}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* User ID */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
          <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-[#176779]" />
            User Account ID
          </span>
          <p className="font-mono text-xs text-[#18282A] break-all select-all">
            {currentUser.id}
          </p>
        </div>

        {/* Phone Number */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
          <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-[#176779]" />
            Phone Number
          </span>
          <p className="text-xs font-medium text-[#18282A]">
            {currentUser.phone || "Not specified"}
          </p>
        </div>

        {/* Agency Name (for Agents) */}
        {isAgent && (
          <div className="col-span-1 sm:col-span-2 rounded-xl border border-sky-100 bg-sky-50/50 p-3 space-y-1">
            <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="h-3 w-3 text-sky-600" />
              Agent Profile Agency
            </span>
            <div className="text-xs font-semibold text-sky-950">
              {isAgentLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-sky-600" />
                  <span>Loading agency details...</span>
                </div>
              ) : agentProfile?.agencyName ? (
                <span>{agentProfile.agencyName}</span>
              ) : (
                <span className="text-sky-700 font-normal italic">
                  No agency name specified
                </span>
              )}
            </div>
          </div>
        )}

        {/* Agent Business Overview (Real Backend Data) */}
        {isAgent && (
          <div
            className="col-span-1 sm:col-span-2 space-y-2.5 pt-1"
            data-testid="admin-agent-business-overview"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#18282A] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-[#176779]" />
                Agent Business Overview
              </span>
              <span className="text-[11px] text-[#74818A]">Real-time operational summary</span>
            </div>

            {isAgentLoading ? (
              <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-[#E5EAED] bg-[#F8FAFB] text-xs text-[#74818A]">
                <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#176779]" />
                Loading agent business metrics...
              </div>
            ) : businessOverview ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[10px] font-semibold text-[#74818A] uppercase">Total Bookings</span>
                  <p className="mt-0.5 text-base font-bold text-[#18282A]">{businessOverview.totalBookings}</p>
                  <p className="text-[10px] text-emerald-700 font-medium">{businessOverview.confirmedBookings} confirmed</p>
                </div>
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[10px] font-semibold text-[#74818A] uppercase">Pending Bookings</span>
                  <p className="mt-0.5 text-base font-bold text-amber-600">{businessOverview.pendingBookings}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{businessOverview.completedBookings} completed</p>
                </div>
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[10px] font-semibold text-[#74818A] uppercase">Total Commission</span>
                  <p className="mt-0.5 text-base font-bold text-[#176779]">
                    ฿{businessOverview.totalCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium">
                    ฿{businessOverview.paidCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} paid
                  </p>
                </div>
                <div className="rounded-xl border border-[#E5EAED] bg-[#F8FAFB] p-2.5">
                  <span className="text-[10px] font-semibold text-[#74818A] uppercase">Pending Commission</span>
                  <p className="mt-0.5 text-base font-bold text-amber-600">
                    ฿{businessOverview.pendingCommission.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">{businessOverview.activeCommissionsCount} active records</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-[#E5EAED] bg-[#F8FAFB] p-3 text-center text-xs text-[#74818A]">
                No business metrics recorded yet for this agent.
              </div>
            )}
          </div>
        )}

        {/* Created Date */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
          <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-[#176779]" />
            Joined Date
          </span>
          <p className="text-xs text-[#18282A]">
            {formatDate(currentUser.createdAt)}
          </p>
        </div>

        {/* Updated Date */}
        <div className="rounded-xl border border-[#E5EAED] bg-white p-3 space-y-1">
          <span className="text-[11px] font-semibold text-[#74818A] uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-[#176779]" />
            Last Updated
          </span>
          <p className="text-xs text-[#18282A]">
            {formatDate(currentUser.updatedAt)}
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5EAED]">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-xs cursor-pointer"
        >
          Close
        </Button>
        {onEditClick && (
          <Button
            type="button"
            size="sm"
            onClick={() => {
              onClose();
              onEditClick(currentUser);
            }}
            className="bg-[#176779] text-xs font-semibold text-white hover:bg-[#135664] cursor-pointer"
            data-testid="user-details-edit-btn"
          >
            Edit User
          </Button>
        )}
      </div>
    </div>
  );
}
