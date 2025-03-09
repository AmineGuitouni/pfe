"use client"

import { createContext, useContext, useState } from "react"
import useGroups from "../hooks/useGroups";
import { Group } from "../types/groupsTypes";
import { CreateGroupRequestBody } from "@/app/api/v1/[user_id]/companies/[company_id]/groups/new/route";

interface GroupsContextType {
    selectedGroup: string | null;
    setSelectedGroup: React.Dispatch<React.SetStateAction<string | null>>;
    groups: Group[],
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
    loadingGroups: boolean,
    addGroup: (newGroup: CreateGroupRequestBody) => Promise<void>,
    getGroupUsersDetails: (groupId: string[]) => Promise<any>
}

const groupsContext = createContext<GroupsContextType | undefined>(undefined)

export function useGroupsContext() {
    const context = useContext(groupsContext)
    if (!context) {
        throw new Error("useGroupsContext must be used within a GroupsContextProvider")
    }
    return context
}

export default function GroupsContextProvider({ children, company_id }: { children: React.ReactNode, company_id: string }) {
    const {groups, setGroups, loading:loadingGroups, addGroup, getGroupUsersDetails} = useGroups(company_id)
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <groupsContext.Provider value={{
            selectedGroup,
            setSelectedGroup,
            groups,
            setGroups,
            isOpen,
            setIsOpen,
            loadingGroups,
            addGroup,
            getGroupUsersDetails
        }}>
            {children}
        </groupsContext.Provider>
    )
}