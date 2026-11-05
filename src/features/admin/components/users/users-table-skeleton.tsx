import * as React from "react";

export function UsersTableSkeleton({ rowCount = 5 }: { rowCount?: number }) {
  return (
    <div className="space-y-3 p-4" data-testid="users-table-skeleton">
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-4 py-3 border-b border-[#E5EAED] last:border-b-0 animate-pulse"
        >
          {/* User info */}
          <div className="flex items-center gap-3 w-1/4">
            <div className="h-9 w-9 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-1.5 w-full">
              <div className="h-3.5 w-28 rounded bg-slate-200" />
              <div className="h-3 w-36 rounded bg-slate-100" />
            </div>
          </div>

          {/* Phone */}
          <div className="w-1/6 hidden sm:block">
            <div className="h-3.5 w-24 rounded bg-slate-200" />
          </div>

          {/* Role */}
          <div className="w-1/8">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>

          {/* Status */}
          <div className="w-1/8">
            <div className="h-5 w-16 rounded-full bg-slate-200" />
          </div>

          {/* Joined Date */}
          <div className="w-1/6 hidden md:block">
            <div className="h-3.5 w-20 rounded bg-slate-200" />
          </div>

          {/* Actions */}
          <div className="w-8 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
