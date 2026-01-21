"use client"
import { Button, useDisclosure } from "@heroui/react";
import { GrChapterAdd } from "react-icons/gr";
import AddModal from "./AddModal";

export default function AddColumnButton() {

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    return (
        <div>
            <AddModal isOpen={isOpen} onOpenChange={onOpenChange} />
            <Button 
                // isIconOnly 
                radius="sm"
                startContent={<GrChapterAdd size={15} />}
                variant="light" 
                className=" text-white hover:scale-105 transition-all ease-linear border-1 mx-4 border-white/30" 
                onPress={onOpen}
            > 
                Add column
            </Button>
        </div>
    );
}
