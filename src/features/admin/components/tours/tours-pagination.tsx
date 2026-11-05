import * as React from "react";
import { Pagination } from "@/components/shared/pagination";

export interface ToursPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}

export function ToursPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
}: ToursPaginationProps) {
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
      itemLabel="tours"
      isFetching={isFetching}
      dataTestId="tours-pagination"
      buttonTestIdPrefix="pagination"
    />
  );
}
