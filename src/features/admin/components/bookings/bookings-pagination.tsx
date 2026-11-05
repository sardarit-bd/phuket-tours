import * as React from "react";
import { Pagination } from "@/components/shared/pagination";

export interface BookingsPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}

export function BookingsPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
}: BookingsPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      pageSize={limit}
      totalItems={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onLimitChange}
      pageSizeOptions={[10, 25, 50, 100]}
      pageSizeLabel="Rows:"
      itemLabel="bookings"
      isFetching={isFetching}
      dataTestId="bookings-pagination"
      buttonTestIdPrefix="pagination"
    />
  );
}
