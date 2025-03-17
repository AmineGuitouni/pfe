"use client"

import { Input } from "@heroui/react"
import { SearchIcon } from "./icons"
import AddProjectModal from "../modals/addProjectModal"
import { usePathname, useRouter } from "next/navigation"

interface TableFiltersProps {
  searchText: string
  onSearchChange?: (value: string) => void
}

export const TableFilters = ({
  searchText,
  onSearchChange,
}: TableFiltersProps) => {
  const router = useRouter();
  const pathName = usePathname();
  const createProject = async (project: { name: string; description: string; deadline: string }) => {
    const params = new URLSearchParams();
    params.set("projectName", project.name);
    params.set("projectDescription", project.description);
    params.set("projectDeadline", project.deadline);
    router.push(`${pathName}/new?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 justify-between items-center">
        <Input
          isClearable
          placeholder="Search projects..."
          value={searchText}
          onClear={() => onSearchChange?.("")}
          onValueChange={onSearchChange}
          className="flex-grow max-w-lg"
          startContent={<SearchIcon className="text-default-300" />}
          variant="bordered"
        />
        <AddProjectModal onCreateProject={createProject} />
      </div>
    </div>
  )
}