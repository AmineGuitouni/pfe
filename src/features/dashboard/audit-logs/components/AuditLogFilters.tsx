"use client";

import { Input, Select, SelectItem } from "@heroui/react";

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
        <Select
          aria-label="Action type"
          placeholder="Select action..."
          selectedKeys={searchText ? [searchText] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string || "";
            onSearchChange?.(value);
          }}
          className="flex-grow"
          classNames={{
            base: "w-full h-full bg-dark_blue",
            trigger: [
              "bg-dark_blue",
              "text-light_blue",
              "placeholder:text-light_blue",
              "border-light_blue/20",
              "hover:bg-light_blue-500/10",
              "focus:bg-light_blue-500/20",
            ],
            popoverContent: "bg-modal_bg text-light_blue",
          }}
          variant="bordered"
        >
          <SelectItem key="">All actions</SelectItem>
          <SelectItem key="delete">Delete</SelectItem>
          <SelectItem key="update">Update</SelectItem>
          <SelectItem key="insert">Insert</SelectItem>
        </Select>
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => onDateFilterChange?.(e.target.value)}
          classNames={{
            base: "w-full sm:w-auto bg-dark_blue",
            input: [
                "bg-dark_blue",
                "text-light_blue",
                "placeholder:text-light_blue",
            ],
            innerWrapper: "bg-dark_blue text-light_blue-500",
            inputWrapper: [
                "bg-dark_blue border-light_blue/20",
                "!cursor-text",
                "hover:bg-light_blue-500/10",
                "group-data-[focus=true]:bg-light_blue-500/20",
                "group-data-[hover=true]:bg-light_blue-500/10",
            ],
            }}
          variant="bordered"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-light_blue text-small">Total {totalCount} logs</span>
        <label className="flex items-center text-light_blue text-small">
          Rows per page:
          <select
            className="bg-dark_blue outline-none text-light_blue text-small border border-light_blue/20 rounded ml-2 px-2 py-1 hover:bg-light_blue-500/10 focus:bg-light_blue-500/20"
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