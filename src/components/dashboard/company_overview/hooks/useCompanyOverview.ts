import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";

export default function useCompanyOverview(company_id: string) {
    const [company, setCompany] = useState<CompanyType | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const {data : session} = useSession();

    const fetchCompany = useCallback( async () => {
        setLoading(true);
        setError(null);
        if(!company_id) {
            setError("Company ID is required");
            setLoading(false);
            return;
        }
        if(!session?.user.id) {
            setError("User ID is required");
            setLoading(false);
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
            setError((error as Error).message);
        } finally {
            setLoading(false);
        }
    },[company_id, session?.user.id]);

    useEffect(() => {
        if (company_id) {
            fetchCompany();
        }
    }
    , [company_id, fetchCompany, session?.user.id]);

    return {
        company,
        loading,
        error,
        fetchCompany,
    };

}
   