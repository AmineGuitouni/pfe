import GroupCardContainer from "@/components/dashboard/groups/components/groupCardContainer";
import GroupsDetailsContainer from "@/components/dashboard/groups/components/groupsDetailsContainer";
import GroupsContextProvider from "@/components/dashboard/groups/contexts/groupsProvider";

export default function DataBasesPage() {
    return (
        <div className="w-full p-10">
            <div className="w-full gap-5 flex justify-between">
                <GroupsContextProvider>
                    <GroupCardContainer/>                        
                    <GroupsDetailsContainer/>
                </GroupsContextProvider>
            </div>
        </div>
    );
}