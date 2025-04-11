"use client"
import { Input } from "@heroui/react";
import { useFilesContext } from "../hooks/useFilesContext";
import { IoSearchOutline } from "react-icons/io5";

export default function Search() {
    const { searchTerm, setSearchTerm } = useFilesContext();
    
    return (
        <Input
            placeholder="Search files and folders..."
            size="sm"
            className="w-full dark text-white"
            value={searchTerm}
            onValueChange={setSearchTerm}
            endContent={<IoSearchOutline className="text-light_blue-500/70" />}
            variant="bordered"
        />
    )
}