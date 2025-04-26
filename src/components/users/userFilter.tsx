"use client";

import { Input } from "@heroui/react";
import { SearchIcon } from "../dashboard/audit-logs/components/icons";
import AddModal from "./addUserButton";
import RoleFilter from "./roleFilter";

interface UsersFiltersProps {
  searchText: string;
  onSearchChange?: (value: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange?: (value: number) => void;
  totalCount: number;
  company_id: string;
  selectedGroups: Set<string>;
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export const UsersFilters = ({
  searchText,
  onSearchChange,
  rowsPerPage,
  onRowsPerPageChange,
  totalCount,
  company_id,
  selectedGroups,
  setSelectedGroups
}: UsersFiltersProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          isClearable
          placeholder="Search actions..."
          value={searchText}
          onClear={() => onSearchChange?.("")}
          onValueChange={onSearchChange}
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
          className="flex-grow"
          variant="bordered"
        />
        <RoleFilter 
          company_id={company_id} 
          selectedGroups={selectedGroups} 
          setSelectedGroups={setSelectedGroups} 
        />
        <AddModal company_id={company_id}/>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-default-400 text-small">Total {totalCount} users</span>
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