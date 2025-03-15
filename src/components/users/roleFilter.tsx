"use client"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useGroups } from "./hooks/useGroups";
import { IoIosArrowDown } from "react-icons/io";

export default function RoleFilter({
  company_id,
  selectedGroups,
  setSelectedGroups,
}: {
  company_id: string,
  selectedGroups: Set<string>,
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>
}) {

  const {groups} = useGroups(company_id);

  // Handle selection change
  const handleSelectionChange = (keys: any) => {
    setSelectedGroups(keys);
  };

  return (
    <Dropdown>
      <DropdownTrigger className="hidden sm:flex">
        <Button
          variant="flat"
          endContent={<IoIosArrowDown className="mt-1" />}
          className="bg-white/10 text-light_blue-500 text-sm px-3 flex-shrink-0 "
        >
          {selectedGroups.size > 0 ? selectedGroups.values().next().value : "Filter by group"}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection={false}
        aria-label="Table Columns"
        closeOnSelect={false}
        selectedKeys={selectedGroups}
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
      >
        {groups.map((groupItem) => (
          <DropdownItem key={groupItem.name} className="capitalize">
            {groupItem.name}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}