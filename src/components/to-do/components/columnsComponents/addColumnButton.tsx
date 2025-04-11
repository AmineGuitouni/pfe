"use client"
import { Button, useDisclosure } from "@heroui/react";
import { GrChapterAdd } from "react-icons/gr";
import AddModal from "./AddModal";

export default function AddColumnButton() {

    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    
    return (
        <div className="hover:w-14 w-5 h-fit bg-transparent transition-all ease-linear group flex justify-center">
            <AddModal isOpen={isOpen} onOpenChange={onOpenChange} />
            <Button 
                isIconOnly 
                variant="light" 
                className="scale-0 group-hover:scale-100 text-white transition-all ease-linear mt-4 mx-1" 
                onPress={onOpen}
            > 
                <GrChapterAdd size={20} />
            </Button>
        </div>
    );
}
