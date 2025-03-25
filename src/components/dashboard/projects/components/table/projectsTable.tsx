"use client";

import {
  Spinner,
  Table,
  TableBody,
  TableColumn,
  TableHeader,
  TableRow,
  TableCell,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
  Button,
  useDisclosure
} from "@heroui/react";
import { TablePagination } from "./tablePagination";
import useProjects from "../../hooks/useProjects";
import { TableFilters } from "./tableFilters";
import { formatShortDate } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FaEllipsisVertical } from "react-icons/fa6";
import ProjectDeleteConfirmation from "../modals/ProjectDeleteConfirmationModal";
import { toast } from "react-toastify";

const columns = [
  { name: "Name", uid: "name", sortable: true },
  { name: "Description", uid: "description", sortable: false },
  { name: "Tasks", uid: "tasks", sortable: false },
  { name: "Dedline", uid: "dedline", sortable: true },
  { name: "Created At", uid: "created_at", sortable: true },
  { name: "Actions", uid: "actions", sortable: false },
]

export default function ProjectsTable({company_id}: {company_id: string}) {
  const router = useRouter();
  const pathName = usePathname();
  const {isOpen: isOpenDelete, onOpen: onOpenDelete, onOpenChange: onOpenChangeDelete} = useDisclosure()
  
  const {
    projects,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchText,
    setSearchText,
    sortDescriptor,
    setSortDescriptor,
    deleteProject
  } = useProjects({
    company_id,
  });

  return (
    <div className="bg-transparent text-white min-h-screen w-full dark">
      <Table
        aria-label="Audit Logs"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          base: "w-full",
          table: "w-full",
          thead: "rounded-none",
          tr: "border-b border-white/20 hover:bg-white/5",
          th: "bg-white/10 text-default-500 border-b border-divider rounded-none",
          td: "p-3",
          wrapper: "bg-modal_bg/50",
        }}
        bottomContent={
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        }
        topContent={
          <TableFilters
            searchText={searchText}
            onSearchChange={setSearchText}
          />
        }
      >
        <TableHeader>
          {
            columns.map((column) => (
              <TableColumn key={column.uid} allowsSorting={column.sortable}>
                {column.name}
              </TableColumn>
            ))
          }
        </TableHeader>
        <TableBody
          emptyContent="No projects found"
          items={isLoading ? [] : projects.map(project => ({
            key: project.id,
            data: project,
            actions: {deleteProject}
          }))}
          isLoading={isLoading}
          loadingContent={<Spinner size="lg" />}
        >
          {(item) => (
            <TableRow key={item.key}>
              <TableCell>{item.data.name}</TableCell>
              <TableCell>{item.data.description}</TableCell>
              <TableCell>{item.data.tasks_count}</TableCell>
              <TableCell>{item.data.deadline || "No deadline"}</TableCell>
              <TableCell>{formatShortDate(item.data.created_at)}</TableCell>
              <TableCell>
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="light" size="sm" isIconOnly>
                      <FaEllipsisVertical size={20}/>
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Dynamic Actions">
                    <DropdownItem
                      key="view"
                      onPress={()=>{
                        router.push(`${pathName}/${item.data.id}/assign-workers`)
                      }}
                    >
                      View
                    </DropdownItem>
                    <DropdownItem
                      key="Delete"
                      onPress={onOpenDelete}
                      color="danger"
                      variant="flat"
                    >
                      Delete
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                <ProjectDeleteConfirmation 
                  projectName={item.data.name} 
                  onConfirmDelete={async ()=>{
                    if(await deleteProject(item.data.id)){
                      toast.success("Project deleted successfully");
                    }
                    else{
                      toast.error("Failed to delete project");
                    }
                  }} 
                  isOpen={isOpenDelete} 
                  onOpenChange={onOpenChangeDelete}
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}