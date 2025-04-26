import CompanyOverview from "@/components/dashboard/company_overview/components/company_overview";


export default function CompanyPage({ params: { company} }: {params: {company: string}}) { 

    return (
        <div className="w-full h-full flex flex-col gap-5 p-10">
            <CompanyOverview company_id={company}/>
        </div>
    );
}