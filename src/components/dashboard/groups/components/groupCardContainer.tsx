"use client"
import { motion } from "framer-motion";
import { useGroupsContext } from "../contexts/groupsProvider";
import GroupCard from "./groupCard";

const containerVariants = {
    closed: {
        width: "384px",
    },
    open: {
        width: "100%",
    },
}

export default function GroupCardContainer(){
    const { selectedGroup, groups } = useGroupsContext()

    return(
        <motion.div
            variants={containerVariants}
            initial="open"
            animate={selectedGroup ? "closed" : "open"}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-5 flex-shrink-0"
        >
            {
                groups.map((group, index) => (
                    <GroupCard key={index} group={group}/>
                ))
            }
        </motion.div>
    )
}