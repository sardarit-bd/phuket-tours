"use client";

import * as React from "react";
import { Pagination } from "@/components/shared/pagination";

export interface PaymentsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}

export function PaymentsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
}: PaymentsPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      pageSize={limit}
      totalItems={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onLimitChange}
      pageSizeOptions={[10, 25, 50]}
      pageSizeLabel="Rows:"
      itemLabel="payments"
      isFetching={isFetching}
      dataTestId="payments-pagination"
      buttonTestIdPrefix="payments-pagination"
    />
  );
}
