"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SortDescriptor } from "@heroui/react";
import { User } from "../types/types";
import { toast } from "react-toastify";

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
  const [excludedUsers, setExcludedUsers] = useState<string[]>([]);
  const { data: session } = useSession();
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [availableGroups, setAvailableGroups] = useState<string[]>([]);

  // Fetch available groups for the company
  useEffect(() => {
    const fetchGroups = async () => {
      if (!session?.user.id || !companyId) return;
      
      try {
        const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/groups`);
        const data = await response.json();
        if (data && Array.isArray(data.groups)) {
          setAvailableGroups(data.groups);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };
    
    fetchGroups();
  }, [session?.user.id, companyId]);

  const fetchUsers = useCallback(async () => {
    if (!session?.user.id || !companyId) return;
    setLoading(true);
    
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: rowsPerPage.toString(),
      search: searchText,
      sort: sortDescriptor.direction,
      excludedUsers: JSON.stringify(excludedUsers),
    });

    // Add selected groups to the params if any are selected
    if (selectedGroups.size > 0) {
      params.append('groups', JSON.stringify(Array.from(selectedGroups)));
    }

    try {
      const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/users/list?${params.toString()}`);
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
  }, [currentPage, rowsPerPage, searchText, session?.user.id, companyId, sortDescriptor, excludedUsers, selectedGroups]);

  // Refetch users when filter parameters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refetch = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = async (userId: string) => {
    if (!session?.user.id || !companyId) return;
    
    try {
      await fetch(`/api/v1/${session?.user.id}/companies/${companyId}/users/${userId}/delete`, {
        method: "DELETE",
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user");
    }
  }

  const editUser = async (updatedUser: User) => {
    if (!session?.user.id || !companyId) return null;
    if(!updatedUser || !updatedUser.id) return null;

    try {
      const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/users/${updatedUser.id}/edit`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user: updatedUser }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || "Error updating user");
        return;
      }

      setUsers((prevUsers) => prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)));
      toast.success("User updated successfully");
      return;
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "Error updating user");
      return;
    }
  }

  return {
    editUser,
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
    deleteUser,
    refetch,
    setExcludedUsers,
    selectedGroups,
    setSelectedGroups,
    availableGroups
  };
};