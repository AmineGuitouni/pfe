"use client"
import { createContext, useContext, useEffect, useState } from "react";

export type Company = {
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

    const fetchCompanies = async () => {
        const originUrl = window.location.origin;
        try {
            const response = await fetch(`${originUrl}/api/dashboard/companies`, {
                method: "GET",
            });
            const result = await response.json();
            
            if (result.error) {
                setError(true);
            } else {
                setCompanies(result.data);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    console.log(companies);

    useEffect(() => {
        if (!companies) {
            fetchCompanies();
        }
    }, [companies]);

    return (
        <companyContext.Provider value={{ companies, error, setCompanies, loading }}>
            {children}
        </companyContext.Provider>
    );
}