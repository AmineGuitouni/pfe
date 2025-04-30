import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

// Define the expected structure of the data items
interface AnalyticsData {
    // Define the properties based on the API response structure
    // Example: task_id: string; updated_at: string; status: string;
    [key: string]: any; // Use a more specific type if possible
}

export default function useAnalytics({
    company_id,
    worker_ids // Optional worker_ids parameter (array of strings)
}: {
    company_id: string;
    worker_ids?: string[];
}) {
    const [data, setData] = useState<AnalyticsData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Internal state for month, year, and day
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1); // Current month (1-12)
    const [year, setYear] = useState<number>(new Date().getFullYear()); // Current year
    const [day, setDay] = useState<number | null>(null); // Day state, null means all days

    const { data: session } = useSession();
    const user_id: string | undefined = session?.user.id;

    // Memoize fetchData
    const fetchData = useCallback(async () => {
        if (!user_id || !company_id) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiUrl = new URL(
                `/api/v1/${user_id}/companies/${company_id}/analytics/list/employee-details`,
                window.location.origin
            );

            // Add required query parameters from state
            apiUrl.searchParams.append('month', String(month));
            apiUrl.searchParams.append('year', String(year));

            // Add optional query parameters from state
            if (day !== null) { // Check if day is set
                apiUrl.searchParams.append('day', String(day));
            }
            if (worker_ids && worker_ids.length > 0) {
                apiUrl.searchParams.append('worker_id', JSON.stringify(worker_ids));
            }

            const response = await fetch(apiUrl.toString());

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result.data || []);

        } catch (err: any) {
            console.error("Failed to fetch analytics data:", err);
            setError(err.message || "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [company_id, user_id, month, year, day, worker_ids]); // Dependencies include all states

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Return state and setters
    return { data, loading, error, month, year, day, setMonth, setYear, setDay, refetch: fetchData };
}