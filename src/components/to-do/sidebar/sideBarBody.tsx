import { cn, Input } from "@heroui/react";
import { FiSearch } from "react-icons/fi";
import ProjectItem from "./projectItem";

export default function SideBarBody({isOpen}:{isOpen: boolean}) {
    return (
        <div className={cn("w-full h-full flex-col  ",isOpen ? "flex" : "hidden")}>
            <div className="w-full h-[50px] flex items-center border-b-1 border-b-white/20 pl-16">
                <p className="text-light_blue-500 text-md w-fit h-fit line-clamp-1">Projects List</p>
            </div>
            
            <div className="w-full flex items-center justify-center border-b-1 border-b-white/20 px-3 py-4">
                <Input isClearable
                    classNames={{
                    base: "w-full h-full dark",
                    input: [
                        "bg-transparent",
                        "text-white/90 ",
                        "placeholder:text-white/90",
                    ],
                    innerWrapper: "bg-transparent text-white",
                    inputWrapper: [
                        "bg-white/5",
                        "!cursor-text",
                        "hover:bg-white/10",
                        "group-data-[focus=true]:bg-white/5",
                        "group-data-[hover=true]:bg-white/5",
                    ],
                    }}
                    placeholder="Type to search..."
                    radius="sm"
                    startContent={<FiSearch size={20} className="text-light_blue" />} />
            </div>

            <ProjectItem/>
            <ProjectItem/><ProjectItem/><ProjectItem/><ProjectItem/><ProjectItem/><ProjectItem/>
        </div>
    )
}