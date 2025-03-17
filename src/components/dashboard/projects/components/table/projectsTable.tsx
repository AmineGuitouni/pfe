"use client";

import { Spinner, Table, TableBody, TableColumn, TableHeader } from "@heroui/react";
import { TablePagination } from "./tablePagination";
import { ProjectsTableRow } from "./tableRow";
import useProjects from "../../hooks/useProjects";
import { TableFilters } from "./tableFilters";

const columns = [
  { name: "Name", uid: "name", sortable: true },
  { name: "Description", uid: "description", sortable: false },
  { name: "Tasks", uid: "tasks", sortable: false },
  { name: "Dedline", uid: "dedline", sortable: true },
  { name: "Created At", uid: "created_at", sortable: true },
  { name: "Actions", uid: "actions", sortable: false },
]

export default function ProjectsTable({company_id}: {company_id: string}) {
  const {
    projects,
    isLoading,
    currentPage,
    setCurrentPage,
    totalPages,
    searchText,
    setSearchText,
    sortDescriptor,
    setSortDescriptor
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
          emptyContent="No logs found"
          items={projects}
          isLoading={isLoading}
          loadingContent={<Spinner size="lg" />}
        >
          {(log) => {
            return ProjectsTableRow({ log });
          }}
        </TableBody>
      </Table>
    </div>
  );
}