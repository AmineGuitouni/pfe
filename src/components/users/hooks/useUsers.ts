"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SortDescriptor } from "@heroui/react";
import { User } from "../types";

export const useUsers = (companyId: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchUsers = useCallback(async () => {
    if (!session?.user.id || !companyId) return;
    setLoading(true);
    
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: rowsPerPage.toString(),
      search: searchText,
      sort: sortDescriptor.direction,
    });

    try {
      const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/users?${params.toString()}`);
      const { data, count } = await response.json();
      
      setUsers(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, rowsPerPage, searchText, session?.user.id, companyId, sortDescriptor]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
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
    refetch,
  };
};