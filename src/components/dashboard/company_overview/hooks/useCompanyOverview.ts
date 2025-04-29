import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

// Define the required output structure for project analytics data
export type projectData = {
    workers: {
      user_id: string;
      first_name: string;
      last_name: string;
      image: string | null;
      tasks_done: number;
      tasks_per_week: number;
      tasks_rate: number;
      tasks_assigned: number;
    }[];
    task_count: number;
    id_project: string;
    name: string; // Added name based on API response structure
    deadline: string | null;
    tasks_done: number;
    tasks_to_do: number;
    tasks_blocked: number;
    created_at_project: string;
    tasks_per_week: number;
    tasks_rate: number;
  };

export default function useCompanyOverview(company_id: string) {
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [companyLoading, setCompanyLoading] = useState<boolean>(false);
    const [companyError, setCompanyError] = useState<string | null>(null);
    const [projectAnalyticsData, setProjectAnalyticsData] = useState<projectData[] | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
    const [analyticsError, setAnalyticsError] = useState<string | null>(null);
    const {data : session} = useSession();

    const fetchCompany = useCallback( async () => {
        setCompanyLoading(true);
        setCompanyError(null);
        if(!company_id) {
            setCompanyError("Company ID is required");
            setCompanyLoading(false);
            return;
        }
        if(!session?.user.id) {
            setCompanyError("User ID is required");
            setCompanyLoading(false);
            return;
        }
        try {
            const response = await fetch(`/api/v1/${session?.user.id}/companies/list/get_company_by_id?company_id=${company_id}`);
            if (!response.ok) {
                throw new Error("Failed to fetch company data");
            }
            const data = await response.json();
            setCompany(data.data);
        } catch (error) {
            setCompanyError((error as Error).message);
        } finally {
            setCompanyLoading(false);
        }
    },[company_id, session?.user.id]);

    const fetchProjectAnalytics = useCallback(async () => {
        setAnalyticsLoading(true);
        setAnalyticsError(null);
        if (!company_id || !session?.user.id) {
            setAnalyticsError("Company ID and User ID are required");
            setAnalyticsLoading(false);
            return;
        }
        try {
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/analytics/list/project-details`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch project analytics data");
            }
            const data = await response.json();
            setProjectAnalyticsData(data.data); // Assuming the API returns { data: projectData[] }
        } catch (error) {
            setAnalyticsError((error as Error).message);
        } finally {
            setAnalyticsLoading(false);
        }
    }, [company_id, session?.user.id]);

    useEffect(() => {
        if (company_id && session?.user.id) {
            fetchCompany();
            fetchProjectAnalytics();
        }
    }
    , [company_id, fetchCompany, fetchProjectAnalytics, session?.user.id]);

    return {
        company,
        companyLoading,
        companyError,
        fetchCompany,
        projectAnalyticsData,
        analyticsLoading,
        analyticsError,
        fetchProjectAnalytics,
        // Combined loading state for convenience
        loading: companyLoading || analyticsLoading,
        // Combined error state (prioritize company error for now)
        error: companyError || analyticsError,
    };

}