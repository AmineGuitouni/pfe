"use client";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { AuditLogFilters } from "../components/AuditLogFilters";
import { AuditLogPagination } from "../components/AuditLogPagination";
import { Spinner, Table, TableBody, TableColumn, TableHeader } from "@heroui/react";
import { AuditLogRow } from "../components/AuditLogRow";

export default function AuditLogTable({company_id}: {company_id: string}) {
  const {
    logs,
    totalCount,
    loading,
    searchText,
    setSearchText,
    dateFilter,
    setDateFilter,
    sortDescriptor,
    setSortDescriptor,
    currentPage,
    setCurrentPage,
    rowsPerPage,
    setRowsPerPage,
  } = useAuditLogs(company_id);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

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
          <AuditLogPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        }
        topContent={
          <AuditLogFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            totalCount={totalCount}
          />
        }
      >
        <TableHeader>
          <TableColumn key="id">ID</TableColumn>
          <TableColumn key="action">Action</TableColumn>
          <TableColumn key="date" allowsSorting>
            Date
          </TableColumn>
          <TableColumn key="details">Details</TableColumn>
        </TableHeader>
        <TableBody
          emptyContent="No logs found"
          items={logs}
          isLoading={loading}
          loadingContent={<Spinner size="lg" color="white" />}
        >
          {(log) => {
            return AuditLogRow({ log });
          }}
        </TableBody>
      </Table>
    </div>
  );
}