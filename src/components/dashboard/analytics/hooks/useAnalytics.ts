import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";

// Define the structure for status counts
type StatusCounts = Record<"To Do" | "In Progress" | "Completed" | "Blocked" | 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme', number>;

// Define the structure for data points with hour or day label
type HourlyDataPoint = StatusCounts & { hour: string };
type DailyDataPoint = StatusCounts & { day: number };

// Union type for the chart data points
type ChartDataPoint = HourlyDataPoint | DailyDataPoint;

// Updated AnalyticsData type
type AnalyticsData = {
    chartData: {
        type: "day" | "month"; // Corresponds to hourly ('day') or daily ('month') grouping
        data: ChartDataPoint[];
    }
}

export default function useAnalytics({
    company_id,
}: {
    company_id: string;
}) {
    const [data, setData] = useState<AnalyticsData>();
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [day, setDay] = useState<number | null>(null);

    const [dateType, setDateType] = useState<'month-year' | 'day-month-year'>('day-month-year');

    const { data: session } = useSession();
    const user_id: string | undefined = session?.user.id;

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

            apiUrl.searchParams.append('month', String(month));
            apiUrl.searchParams.append('year', String(year));
            apiUrl.searchParams.append('day', dateType === 'day-month-year' ? String(day) : "null");
            apiUrl.searchParams.append('worker_id', JSON.stringify([selectedUserId]));

            if (day !== null) {
                apiUrl.searchParams.append('day', String(day));
            }

            const response = await fetch(apiUrl.toString());

            if (!response.ok) {
                try{
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }
                catch{
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
            }

            const result = await response.json();
            console.log(result);
            setData({
                chartData: {
                    type: dateType === 'day-month-year' ? 'day' : 'month',
                    data: result.data.chartData
                }
            });

        } catch (err: any) {
            console.error("Failed to fetch analytics data:", err);
            setError(err.message || "An unknown error occurred");
        } finally {
            setLoading(false);
        }
    }, [company_id, user_id, month, year, day, dateType, selectedUserId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, month, year, day, setMonth, setYear, setDay, refetch: fetchData, dateType, setDateType, setSelectedUserId, selectedUserId };
}