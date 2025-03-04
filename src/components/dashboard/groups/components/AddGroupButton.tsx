"use client"
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useGroupsContext } from "../contexts/groupsProvider";

export default function AddGroupButton() {
    const {setIsOpen} = useGroupsContext()
    return (
        <Button
            size="sm"
            className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0"
            startContent={<Plus className="w-4 h-4" />}
            onPress={() => {
                setIsOpen(true)
            }}
        >
            Add Group
        </Button>
    );
}