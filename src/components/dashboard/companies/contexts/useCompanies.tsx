"use client"
import { useSession } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type Company = {
    created_at: any;
    id: string,
    name: string
};

const companyContext = createContext<{
    companies: Company[] | null,
    error: boolean,
    setCompanies: React.Dispatch<React.SetStateAction<Company[] | null>>,
    loading: boolean,
}>({
    companies: null,
    error: false,
    setCompanies: () => {},
    loading: false,
});

export function useCompanies() {
    return useContext(companyContext);
}

export default function CompanyProvider({ children }: { children: React.ReactNode }) {
    const [companies, setCompanies] = useState<Company[] | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const {data: session} = useSession();

    const fetchCompanies = useCallback(async (count: number) => {
        if(!session?.user.id) return
        if(count <= 0){
            return
        }
        const originUrl = window.location.origin;
        try {
            const response = await fetch(`${originUrl}/api/v1/${session.user.id}/companies/list`, {
                method: "GET",
            });
            const result = await response.json();
            
            if (result.error) {
                setError(true);
                fetchCompanies(count - 1);
            } else {
                setCompanies(result.data);
            }
        } catch {
            setError(true);
            fetchCompanies(count - 1);
        } finally {
            setLoading(false);
        }
    },[session?.user.id])

    useEffect(() => {
        fetchCompanies(3);
    }, [fetchCompanies]);

    

    return (
        <companyContext.Provider value={{ companies, error, setCompanies, loading }}>
            {children}
        </companyContext.Provider>
    );
}