"use client"
import { Select, SelectItem } from "@heroui/react";
import { useGroups } from "./hooks/useGroups";
import type { Selection } from "@heroui/react";

export default function RoleFilter({
  company_id,
  selectedGroups,
  setSelectedGroups,
}: {
  company_id: string,
  selectedGroups: Set<string>,
  setSelectedGroups: React.Dispatch<React.SetStateAction<Set<string>>>
}) {
  const { groups } = useGroups(company_id);

  // Handle selection change
  const handleSelectionChange = (keys: Selection) => {
    setSelectedGroups(keys as Set<string>);
  };

  return (
    <div className="hidden sm:block w-[20%]">
      <Select
        className="flex-shrink-0 w-full"
        placeholder="Filter by group"
        selectedKeys={selectedGroups}
        variant="flat"
        selectionMode="multiple"
        onSelectionChange={handleSelectionChange}
        classNames={{
          trigger: "bg-white/10 text-light_blue-500 text-sm px-3 flex-shrink-0"
        }}
      >
        {groups.map((groupItem) => (
          <SelectItem key={groupItem.name} className="capitalize">
            {groupItem.name}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
}