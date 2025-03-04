"use client"
import { motion } from "framer-motion";
import { useGroupsContext } from "../contexts/groupsProvider";
import GroupCard from "./groupCard";
import { Input } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import AddGroupButton from "./AddGroupButton";

const containerVariants = {
    closed: {
        width: "384px",
    },
    open: {
        width: "100%",
    },
}

export default function GroupCardContainer(){
    const { groups, isOpen } = useGroupsContext()
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = groups.filter(group =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return(
        <motion.div 
            className="w-full flex flex-col gap-10 flex-shrink-0"
            variants={containerVariants}
            initial="open"
            animate={isOpen ? "closed" : "open"}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full flex gap-5">
                <AddGroupButton />
                <Input
                    placeholder="Search groups..."
                    size="sm"
                    className="w-full max-w-[300px] dark text-white"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                    variant="bordered"
                />
            </div>
            
            <div
                className="flex flex-wrap gap-5"
            >
                {filteredGroups.map((group, index) => (
                    <GroupCard key={index} group={group}/>
                ))}
            </div>
        </motion.div>
    )
}