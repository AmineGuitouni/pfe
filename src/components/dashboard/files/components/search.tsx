"use client"
import { Input } from "@heroui/react";
import { useFilesContext } from "../hooks/useFilesContext";
import { IoSearchOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { KeyboardEvent } from "react"; // Import KeyboardEvent type

export default function Search() {
    const { searchTerm, setSearchTerm } = useFilesContext();
    const router = useRouter();

    return (
        <Input
            placeholder="Search files and folders..."
            size="sm"
            className="w-full dark text-white"
            value={searchTerm}
            onValueChange={setSearchTerm}
            endContent={<IoSearchOutline className="text-light_blue-500/70" />}
            variant="bordered"
            onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                if (event.key === "Enter") {
                    const currentUrl = new URL(window.location.href);
                    const params = new URLSearchParams(currentUrl.search);

                    if (searchTerm && searchTerm.length > 0) {
                        params.set("query", searchTerm);
                    } else {
                        params.delete("query");
                    }

                    const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
                    router.replace(newUrl);
                }
                else{
                    const currentUrl = new URL(window.location.href);
                    const params = new URLSearchParams(currentUrl.search);
                    params.delete("query");
                    
                    router.replace(`${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`);
                }
            }}
        />
    )
}