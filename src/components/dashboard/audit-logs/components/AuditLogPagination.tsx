"use client";

import { Pagination } from "@heroui/react";

interface AuditLogPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

export const AuditLogPagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: AuditLogPaginationProps) => {
  return (
    <div className="py-2 px-2 w-full flex justify-center items-center">
      <Pagination
        showControls
        classNames={{
          base:"w-fit",
          cursor: "bg-light_blue text-background",
          item: "hover:bg-light_blue hover:text-background",
        }}
        color="default"
        page={currentPage}
        total={totalPages}
        variant="light"
        onChange={onPageChange}
      />
    </div>
  );
};