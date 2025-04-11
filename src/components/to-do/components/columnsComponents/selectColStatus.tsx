import { Select, SelectItem } from "@heroui/react";
import React from "react";
import type { Selection } from "@react-types/shared"; // Import Selection type

const status = [
  {key: "To Do", label: "To Do"},
  {key: "Completed", label: "Done"},
  {key: "In Progress", label: "In Progress"},
  {key: "Blocked", label: "Blocked"},
  {key: "All", label: "Any"},
];

interface SelectColStatusProps {
  selectedValue: string;
  onSelectionChange: (value: string) => void;
}

export default function SelectColStatus({ selectedValue, onSelectionChange }: SelectColStatusProps) {
  return (
    <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
      <Select
        className="w-full dark"
        label="Select Status"
        selectionMode="single"
        selectedKeys={new Set([selectedValue])} // Use selectedKeys and wrap value in a Set
        onSelectionChange={(keys: Selection) => {
          // Extract the single key from the Selection Set
          const selectedKey = keys === "all" ? "all" : Array.from(keys)[0];
          if (selectedKey !== undefined) {
            onSelectionChange(selectedKey.toString());
          }
        }}
      >
        {status.map((stat) => (
          <SelectItem key={stat.key}>{stat.label}</SelectItem>
        ))}
      </Select>
    </div>
  );
}
