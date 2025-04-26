"use client"
import { Button, cn } from "@heroui/react";
import { motion } from "framer-motion";
import { useState } from "react";
import { IoIosArrowForward } from "react-icons/io";
import SideBarBody from "./sideBarBody";
import { TaskBoard } from "../../types/type";
export default function ToDoSidebar({projects,isLoading,search,setSearch}:{projects: TaskBoard | undefined,isLoading: boolean,search:string, setSearch: (value: string) => void}) {

    const [open, setOpen] = useState(false);

    return (
        <motion.div
        variants={{
            open: { width: 300 },
            closed: { width: 20}
        }}
        animate={open ? "open" : "closed"}
        transition={{ duration: 0.2 }}
         className=" h-full w-5 border-l-1 bg-dark_blue border-l-white/20">
            <Button onPress={() => setOpen(!open)} size="sm" startContent={<IoIosArrowForward className={cn("text-white",!open ? "rotate-180" : "")} size={12} />} isIconOnly className={cn("absolute  right-1 top-2 bg-dark_blue   border-1 border-white/20 rounded-full ",open ? "translate-x-[-200px] rounded-sm" : "")}></Button>
            <SideBarBody  isOpen={open} search={search} setSearch={setSearch} projects={projects} isLoading={isLoading} />
        </motion.div>
    )

}