import CompanyOverview from "@/components/dashboard/company_overview/components/company_overview";
import OngoingProjectTable from "@/components/dashboard/company_overview/components/onGoingProjects/onGoingProjectTable";


export default function CompanyPage({ params: { company} }: {params: {company: string}}) { 

    return (
        <div className="w-full h-full overflow-y-auto scrollbar-custom flex flex-col gap-4 lg:p-10 max-w-[1920px] mx-auto  sm:px-6   ">
            <CompanyOverview company_id={company}/>
            <OngoingProjectTable company_id={company}/>
        </div>
    );
}