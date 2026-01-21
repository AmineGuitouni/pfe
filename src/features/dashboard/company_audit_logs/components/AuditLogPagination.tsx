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
    <div className="py-2 px-2 w-full flex justify-center items-center dark">
      <Pagination
        showControls
        classNames={{
          base:"w-fit",
          cursor: "bg-light_blue text-white hover:bg-light_blue/10 hover:text-white",
          item: "hover:bg-light_blue/10 hover:text-white data-[active=true]:bg-light_blue data-[active=true]:text-white data-[hover=true]:bg-light_blue/10 data-[hover=true]:text-white ",
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