"use client"
import { createContext, useContext } from "react";

const companyContext = createContext<string | undefined>(undefined);
export function useCompanyId () {
    const context = useContext(companyContext);
    if(!context){
        throw new Error("useCompanyId must be used within a CompanyProvider")
    }
    return context
}
export default function CompanyProvider({ children,company_id }: { children: React.ReactNode,company_id : string }) {
    return(
        <companyContext.Provider value={company_id}>{children}</companyContext.Provider>
    )
}