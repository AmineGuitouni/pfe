"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { GroupSelected} from "../types/types";

export const useGroups = (companyId: string) => {
  const [groups, setGroups] = useState<GroupSelected[]>([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const fetchUsers = useCallback(async () => {
    if (!session?.user.id || !companyId) return;
    setLoading(true);
    
    const params = new URLSearchParams({
      search: searchText,
    });

    try {
      const response = await fetch(`/api/v1/${session.user.id}/companies/${companyId}/groups/list/get-ids?${params.toString()}`);
      const { data } = await response.json();
      
      setGroups(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [searchText, session?.user.id, companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);



  return {
    groups,
    loading,
    searchText,
    setSearchText,
  };
};