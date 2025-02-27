"use client"

import { createContext, useContext, useState } from "react"

const sideBarContext = createContext<{
    isOpen: boolean,
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
} | undefined>(undefined)

export function useSidBar(){
    const context = useContext(sideBarContext)
    if(!context){
        throw new Error("useSidBar must be used within a SideBarProvider")
    }
    return context
}

export default function SideBarProvider({children}:{children: React.ReactNode}){
    const [isOpen, setIsOpen] = useState(false)

    return(
        <sideBarContext.Provider value={{isOpen, setIsOpen}}>
            {children}
        </sideBarContext.Provider>
    )
}