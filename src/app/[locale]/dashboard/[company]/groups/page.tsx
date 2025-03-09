import GroupCardContainer from "@/components/dashboard/groups/components/groupCardContainer";
import GroupsDetailsContainer from "@/components/dashboard/groups/components/groupsDetailsContainer";
import GroupsContextProvider from "@/components/dashboard/groups/contexts/groupsProvider";

export default function DataBasesPage({ params: { company } }: {params: {company: string}}) {
    return (
        <div className="w-full p-10">
            <div className="w-full gap-5 flex justify-between">
                <GroupsContextProvider company_id={company}>
                    <GroupCardContainer/>
                    <GroupsDetailsContainer company={company} />
                </GroupsContextProvider>
            </div>
        </div>
    );
}