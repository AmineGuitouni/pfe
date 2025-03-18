import ProjectsTable from "@/components/dashboard/projects/components/table/projectsTable";

export default function DataBasesPage({ params: { company } }: {params: {company: string}}) {
    
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
                <ProjectsTable company_id={company}/>
            </div>
        </div>
    );
}