"use client"
import { Select, SelectItem } from "@heroui/react";
import { useGroups } from "./hooks/useGroups";
import type { Selection } from "@heroui/react";

export default function SelectGroups({
  onSelectionChange,
  company_id
}: {
  onSelectionChange?: (value: Selection) => void,
  company_id: string
}) {
  const { groups, loading } = useGroups(company_id);

  return (
    <Select
      className="w-[60%] mb-3"
      variant="flat"
      items={groups}
      size="sm"
      label="Select groups"
      placeholder="Select groups..."
      isLoading={loading}
      selectionMode="multiple"
      onSelectionChange={(value) => onSelectionChange?.(value)}
    >
      {(item) => (
        <SelectItem key={item.id} className="capitalize">
          {item.name}
        </SelectItem>
      )}
    </Select>
  );
}