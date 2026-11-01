import * as React from "react";
import { Pagination } from "@/components/shared/pagination";

export interface UsersPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  isFetching?: boolean;
}

export function UsersPagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  isFetching = false,
}: UsersPaginationProps) {
  return (
    <Pagination
      currentPage={page}
      pageSize={limit}
      totalItems={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onLimitChange}
      pageSizeOptions={[10, 20, 50, 100]}
      pageSizeLabel="Rows per page:"
      itemLabel="users"
      isFetching={isFetching}
      dataTestId="users-pagination"
      buttonTestIdPrefix="users-pagination"
    />
  );
}
