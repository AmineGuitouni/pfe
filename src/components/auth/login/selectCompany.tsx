"use client"
import {Autocomplete, AutocompleteItem} from "@heroui/react";
import useCompany from "./hooks/useCompany";

export default function SelectCompany({onSelectionChange}:{onSelectionChange?:(value:string | null) => void}) {
  const { companys, setFilter, loading, filter } = useCompany();

  return (
    <Autocomplete
      className="max-w-xs"
      inputValue={filter}
      isLoading={loading}
      items={companys}
      label="Select a character"
      placeholder="Type to search..."
      variant="bordered"
      onInputChange={setFilter}
      onSelectionChange={(value) => onSelectionChange?.(value as string | null)}
    >
      {(item) => (
        <AutocompleteItem key={item.id} className="capitalize">
          {item.name}
        </AutocompleteItem>
      )}
    </Autocomplete>
  );
}
