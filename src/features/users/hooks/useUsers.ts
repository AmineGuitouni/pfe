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

  const GetCvInformations = useCallback(async (id: string) => {
    if (!id) return null;
    
    try {

        const origin = window.location.origin
        console.log(`${origin}/api/v1/${session?.user.id}/companies/${companyId}/users/list/get_cv_info?id=${id}`)
        // Send the ID as a simple string parameter, no JSON stringification needed
        const res = await fetch(`${origin}/api/v1/${session?.user.id}/companies/${companyId}/users/list/get_cv_info?id=${id}`, {
            method: "GET",
        });

        
        // Check for network or server errors first
        if (!res.ok) {
            const errorText = await res.text(); // Get the raw text instead of trying to parse JSON
            console.error("API error response:", errorText);
            throw new Error(`Failed to fetch CV information: ${res.status}`);
        }

        
        const result = await res.json();
        return result.data;
    } catch (error) {
        console.error("Error fetching CV information:", error);
        // Return null instead of throwing to prevent component errors
        return null;
    }
}, [companyId, session?.user.id]);

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
    GetCvInformations,
    excludedUsers
  };
};