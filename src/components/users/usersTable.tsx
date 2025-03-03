"use client";

import { AuditLogPagination } from "../dashboard/audit-logs/components/AuditLogPagination";
import { Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@heroui/react";
import { useUsers } from "./hooks/useUsers";
import { UsersFilters } from "./userFilter";
import { formatShortDate } from "@/lib/utils";

export default function UsersTable({ company_id }: { company_id: string }) {
  const {
    users,
    totalCount,
    loading,
    searchText,
    setSearchText,
    sortDescriptor,
    setSortDescriptor,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
  } = useUsers(company_id);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  return (
    <div className="bg-transparent text-white min-h-screen w-full dark">
      <Table
        aria-label="users table"
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
          <AuditLogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        }
        topContent={
          <UsersFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            totalCount={totalCount}
          />
        }
      >
        <TableHeader>    
          <TableColumn key="first_name" allowsSorting>
            First name
          </TableColumn>
          <TableColumn key="last_name" allowsSorting>
            Last name
          </TableColumn>
          <TableColumn key="email" allowsSorting>
            Email
          </TableColumn>
          <TableColumn key="phone_number" allowsSorting>
            Phone number
          </TableColumn>
          <TableColumn key="country" allowsSorting>
            Country
          </TableColumn>
          <TableColumn key="created_at" allowsSorting>
            Added at
          </TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No logs found"
          items={users}
          isLoading={loading}
          loadingContent={<Spinner size="md" color="white" />}
        >
          {(user) => {
            return (
              <TableRow key={user.id}>
                <TableCell>{user.first_name}</TableCell>
                <TableCell>{user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone_number}</TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>{formatShortDate(user.created_at)}</TableCell>
              </TableRow>
            )
          }}
        </TableBody>
      </Table>
    </div>
  );
}