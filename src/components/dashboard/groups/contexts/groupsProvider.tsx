"use client"

import { createContext, useContext, useState } from "react"
import useGroups from "../hooks/useGroups";
import { Group } from "../types/groupsTypes";

interface GroupsContextType {
    selectedGroup: string | null;
    setSelectedGroup: React.Dispatch<React.SetStateAction<string | null>>;
    groups: Group[],
    setGroups: React.Dispatch<React.SetStateAction<Group[]>>,
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const groupsContext = createContext<GroupsContextType | undefined>(undefined)

export function useGroupsContext() {
    const context = useContext(groupsContext)
    if (!context) {
        throw new Error("useGroupsContext must be used within a GroupsContextProvider")
    }
    return context
}

export default function GroupsContextProvider({ children }: { children: React.ReactNode }) {
    const {groups, setGroups} = useGroups()
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    return (
        <groupsContext.Provider value={{
            selectedGroup,
            setSelectedGroup,
            groups,
            setGroups,
            isOpen,
            setIsOpen
        }}>
            {children}
        </groupsContext.Provider>
    )
}