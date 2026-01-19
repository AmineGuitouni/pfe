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
  useDisclosure,
  cn
} from "@heroui/react";
import { TablePagination } from "./tablePagination";
import useProjects from "../../hooks/useProjects";
import { TableFilters } from "./tableFilters";
import { formatShortDate } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { FaEllipsisVertical } from "react-icons/fa6";
import ProjectDeleteConfirmation from "../modals/ProjectDeleteConfirmationModal";
import { toast } from "react-toastify";
import { ProjectStatusType } from "../../types";

const columns = [
  { name: "Name", uid: "name", sortable: true },
  { name: "Tasks", uid: "tasks", sortable: false },
  { name: "Status", uid: "project_status", sortable: true },
  { name: "Dedline", uid: "dedline", sortable: true },
  { name: "Created At", uid: "created_at", sortable: true },
  { name: "Actions", uid: "actions", sortable: false },
]


const getStatusColor = (status: ProjectStatusType): string => {
    switch (status) {
        case "Not Started":
            return "bg-gray-500";
        case "In Progress":
            return "bg-yellow-600";
        case "Completed":
            return "bg-green-600";
        case "Cancelled":
            return "bg-red-600";
        default:
            return "bg-gray-500";
    }
};

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
          base: "w-full ",
          table: "w-full",
          thead: "rounded-md",
          tr: "hover:bg-white/5",
          th: "bg-white/10 text-default-500 ",
          td: "p-3",
          wrapper: "bg-white/5 rounded-lg",
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
              <TableCell>
                <h2 className="max-w-[200px]">
                  {item.data.name}
                </h2>
              </TableCell>
              <TableCell>{item.data.tasks_count}</TableCell>
              <TableCell>
                <div 
                  className={cn(`status-badge w-fit px-3 py-1.5 rounded-full text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5`,
                    getStatusColor(item.data.project_status)
                  )}
                >
                        {item.data.project_status}
                  </div>
              </TableCell>
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
                        router.push(`${pathName}/${item.data.id}`)
                      }}
                    >
                      View
                    </DropdownItem>
                    <DropdownItem
                      key="edit"
                      onPress={()=>{
                        router.push(`${pathName}/${item.data.id}/edit`)
                      }}
                    >
                      Edit
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