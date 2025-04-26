"use client";

import { Input } from "@heroui/react";
import { SearchIcon } from "./icons";

interface AuditLogFiltersProps {
  searchText: string;
  onSearchChange?: (value: string) => void;
  dateFilter: string;
  onDateFilterChange?: (value: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange?: (value: number) => void;
  totalCount: number;
}

export const AuditLogFilters = ({
  searchText,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalCount,
}: AuditLogFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          isClearable
          placeholder="Search actions..."
          value={searchText}
          onClear={() => onSearchChange?.("")}
          onValueChange={onSearchChange}
          className="dark flex-grow"
          classNames={{
            base: "w-full h-full dark",
            input: [
                "bg-transparent",
                "text-white/90 ",
                "placeholder:text-white/90",
            ],
            innerWrapper: "bg-transparent text-white",
            inputWrapper: [
                "bg-transparent border-white/20",
                "!cursor-text",
                "hover:bg-white/5",
                "group-data-[focus=true]:bg-white/5",
                "group-data-[hover=true]:bg-white/5",

            ],
            }}
          startContent={<SearchIcon className="text-light_blue" />}
          variant="bordered"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange?.(e.target.value)}
          classNames={{
            base: "w-full sm:w-auto dark",
            input: [
                "bg-transparent",
                "text-light_blue" ,
                "placeholder:text-white/90",
            ],
            innerWrapper: "bg-transparent text-light_blue-500",
            inputWrapper: [
                "bg-transparent border-white/20",
                "!cursor-text",
                "hover:bg-white/5",
                "group-data-[focus=true]:bg-white/5",
                "group-data-[hover=true]:bg-white/5",

            ],
            }}
          variant="bordered"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">Total {totalCount} logs</span>
        <label className="flex items-center text-default-400 text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-default-400 text-small"
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange?.(Number(e.target.value))}
          >
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </label>
      </div>
    </div>
  );
};