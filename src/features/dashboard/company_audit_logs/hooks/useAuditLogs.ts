"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SortDescriptor } from "@heroui/react";

export type Log = {
  id: string;
  action: string;
  date: Date;
  old_data: any;
  new_data: any;
  table_name: string;
};

export const useAuditLogs = (company_id : string) => {
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

  const fetchLogs = useCallback(async () => {
    if (!session?.user.id) return;
    if(!company_id) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: rowsPerPage.toString(),
      search: searchText,
      date: dateFilter,
      sort: sortDescriptor.direction,
    });

    try {
      const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/audit-logs/list?${params.toString()}`);
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
  }, [company_id, currentPage, dateFilter, rowsPerPage, searchText, session?.user.id, sortDescriptor.direction]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
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
  };
};