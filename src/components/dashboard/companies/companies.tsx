"use client"
import { useState, useMemo } from 'react';
import { Alert, Input, Spinner } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import CompanyCard from "./companyCard";
import  {useCompanies}  from "./contexts/useCompanies"; // Ensure this import is correct
import AddCompanyButton from './addCompanyButton';

export default function Companies() {
    const { companies, loading, error } = useCompanies();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCompanies = useMemo(() => {
        return companies ? companies.filter((company) => 
            company.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) : [];
    }, [companies, searchTerm]);

    return (
        <div className="w-full flex flex-col gap-10">
            <div className="w-full flex gap-5">
                <AddCompanyButton />
                <Input 
                    placeholder="Search by name" 
                    size="sm" 
                    className="w-[30%] dark text-white" 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    value={searchTerm} 
                    endContent={<IoSearchOutline size={20} className="text-light_blue-500/70 flex-shrink-0" />}  
                    type="text" 
                    variant="bordered"
                />
            </div>

            {loading ? (
                <Spinner className='absolute top-[50%] left-[57%]' color='default'/>
            ) : error ? (
                <Alert description={"Error in fetching companies"} title={"Error"} />
            ) : (
                <div className="flex flex-wrap gap-5">
                    {filteredCompanies.map(company => (
                        <CompanyCard 
                            key={company.id}
                            company={company}
                        />
                        
                    ))}
                </div>
            )}
        </div>
    );
}