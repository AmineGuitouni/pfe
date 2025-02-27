"use client";
import React, { useState, useEffect, useCallback } from "react";
import DetailsModal from "./detailsModal";

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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchLogs = useCallback( async () => {
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: rowsPerPage.toString(),
      search: searchText,
      date: dateFilter,
      sort: sortOrder,
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
    }
  },[currentPage, dateFilter, rowsPerPage, searchText, sortOrder])

  useEffect(() => {
    fetchLogs();
  }, [searchText, dateFilter, currentPage, rowsPerPage, sortOrder, fetchLogs]);

  const totalPages = Math.ceil(totalCount / rowsPerPage);

  console.log(logs)

  return (
    <div className="bg-transparent text-white min-h-screen">
      <div className="w-full mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search actions..."
            className="p-2 text-md bg-white/10 border border-white/20 flex-grow rounded-lg"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setCurrentPage(1);
            }}
          />
          <input
            type="date"
            className="p-2 rounded-lg bg-white/10 border border-white/20 text-whitess"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="p-2 rounded-lg bg-white/10 border border-white/20"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
          >
            <option value="asc" className="text-dark_blue">Oldest First</option>
            <option value="desc" className="text-dark_blue">Newest First</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/20">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-t border-white/20 hover:bg-white/5"
                >
                  <td className="p-3">{log.id}</td>
                  <td className="p-3">{log.action}</td>
                  <td className="p-3">{log.date.toLocaleString()}</td>
                  <td className="px-5"><DetailsModal table_name={log.table_name} oldData={log.old_data} newData={log.new_data}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              className="p-1 rounded bg-white/10 border border-white/20"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="10" className="text-dark_blue">
                10
              </option>
              <option value="15" className="text-dark_blue">
                15
              </option>
              <option value="20" className="text-dark_blue">
                20
              </option>
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="px-3 py-1 rounded bg-white/10 border border-white/20 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-white/10 border border-white/20 disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}