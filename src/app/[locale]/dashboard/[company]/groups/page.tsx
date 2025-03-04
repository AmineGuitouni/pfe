import GroupCardContainer from "@/components/dashboard/groups/components/groupCardContainer";
import GroupsDetailsContainer from "@/components/dashboard/groups/components/groupsDetailsContainer";
import GroupsContextProvider from "@/components/dashboard/groups/contexts/groupsProvider";

export default function DataBasesPage() {
    return (
        <div className="w-full p-10">
            <div className="w-full flex gap-5 overflow-x-hidden">
                <GroupsContextProvider>
                    <GroupCardContainer/>
                    <GroupsDetailsContainer/>
                </GroupsContextProvider>
            </div>
        </div>
    );
}