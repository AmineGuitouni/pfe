"use client";

import React, { useState, useEffect, useCallback } from "react";
import DetailsModal from "./detailsModal";
import {
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Input,
  Pagination,
  SortDescriptor,
} from "@heroui/react";
import { useSession } from "next-auth/react";

// Assuming SearchIcon is available; define it if not provided
const SearchIcon = (props:any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

export type Log = {
  id: string;
  action: string;
  date: Date;
  old_data: any;
  new_data: any;
  table_name: string;
};

export default function AuditLogTable() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "date",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Fetch logs from API
  const fetchLogs = useCallback(async () => {
    if (!session?.user.id) return;
    setLoading(true);
    const params = new URLSearchParams({
      user_id: session.user.id,
      page: currentPage.toString(),
      limit: rowsPerPage.toString(),
      search: searchText,
      date: dateFilter,
      sort: sortDescriptor.direction,
    });

    try {
      const response = await fetch(`/api/audit-logs?${params.toString()}`);
      const { data, count } = await response.json();
      setLogs(
        data.map((log: any) => ({
          id: log.id,
          action: log.action,
          date: new Date(log.timestamp),
          old_data: log.old_data,
          new_data: log.new_data,
          table_name: log.table_name,
        }))
      );
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, dateFilter, rowsPerPage, searchText, session?.user.id, sortDescriptor]);

  // Fetch logs when dependencies change
  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Top content: Search, Date filter, Rows per page
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            isClearable
            placeholder="Search actions..."
            value={searchText}
            onClear={() => setSearchText("")}
            onValueChange={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            className="flex-grow"
            startContent={<SearchIcon className="text-default-300" />}
            variant="bordered"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:w-auto"
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {totalCount} logs</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [searchText, dateFilter, rowsPerPage, totalCount]);

  // Bottom content: Pagination
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={currentPage}
          total={totalPages}
          variant="light"
          onChange={setCurrentPage}
        />
      </div>
    );
  }, [currentPage, totalPages]);

  return (
    <div className="bg-transparent text-white min-h-screen w-full dark">
      {loading && logs.length === 0 ? (
        <div className="w-full h-full flex justify-center items-center pt-52">
          <Spinner color="default" />
        </div>
      ) : (
        <Table
          aria-label="Audit Logs"
          topContent={topContent}
          bottomContent={bottomContent}
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
        >
          <TableHeader>
            <TableColumn key="id">ID</TableColumn>
            <TableColumn key="action">Action</TableColumn>
            <TableColumn key="date" allowsSorting>
              Date
            </TableColumn>
            <TableColumn key="details">Details</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No logs found" items={logs}>
            {(log) => (
              <TableRow key={log.id}>
                <TableCell>{log.id}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.date.toLocaleString()}</TableCell>
                <TableCell>
                  <DetailsModal
                    action={log.action.toLowerCase()}
                    table_name={log.table_name}
                    oldData={log.old_data}
                    newData={log.new_data}
                  />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}