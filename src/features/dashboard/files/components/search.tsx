"use client"
import { Input, Button, Tooltip } from "@heroui/react";
import { useFilesContext } from "../hooks/useFilesContext";
import { IoSearchOutline } from "react-icons/io5";
import { MdOutlineTextFields, MdOutlineAutoAwesome } from "react-icons/md";
import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect } from "react";

export default function Search() {
    const { searchTerm, setSearchTerm, searchMode, setSearchMode } = useFilesContext();
    const router = useRouter();

    // Update URL when search mode or term changes
    useEffect(() => {
        const currentUrl = new URL(window.location.href);
        const params = new URLSearchParams(currentUrl.search);

        if (searchMode === 'semantic' && searchTerm && searchTerm.length > 0) {
            params.set("query", searchTerm);
        } else {
            params.delete("query");
        }

        const newUrl = `${currentUrl.origin}${currentUrl.pathname}?${params.toString()}`;
        router.replace(newUrl);
    }, [searchMode, searchTerm, router]);

    return (
        <div className="flex items-center gap-2 w-full">
            <Input
                placeholder={searchMode === 'semantic' ? "Search by content..." : "Search by name..."}
                size="sm"
                className="flex-1 dark text-white"
                value={searchTerm}
                onValueChange={setSearchTerm}
                endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                variant="bordered"
            />
            <Tooltip content={searchMode === 'semantic' ? 'Switch to Name Search' : 'Switch to Semantic Search'}>
                <Button
                    isIconOnly
                    size="sm"
                    className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20"
                    onPress={() => setSearchMode(prev => prev === 'name' ? 'semantic' : 'name')}
                >
                    {searchMode === 'semantic' ? (
                        <MdOutlineAutoAwesome className="h-5 w-5 text-light_blue-500" />
                    ) : (
                        <MdOutlineTextFields className="h-5 w-5 text-light_blue-500" />
                    )}
                </Button>
            </Tooltip>
        </div>
    )
}