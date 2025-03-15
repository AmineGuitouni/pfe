"use client"
import {Autocomplete, AutocompleteItem} from "@heroui/react";
import {useGroups} from "./hooks/useGroups";

export default function SelectGroups({onSelectionChange,company_id}:{onSelectionChange?:(value:string | null) => void,company_id:string}) {

  const { groups, loading,searchText,setSearchText  } = useGroups(company_id);

  return (
    <Autocomplete
      className="w-[60%] mb-3 rounded-lg "
      variant="flat"
      classNames={{
        base:"  border-white/20 border-1 ",
      }}
      inputValue={searchText}
      isLoading={loading}
      items={groups}
      size="sm"
      label="Select a group"
      placeholder="Type to search..."
      onInputChange={setSearchText}
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
