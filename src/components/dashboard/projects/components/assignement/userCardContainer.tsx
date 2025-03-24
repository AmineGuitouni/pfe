"use client"
import { motion } from "framer-motion";
import { Input } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import AddUserButton from "./AddUserButton";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";
import { UserCard } from "./usersCard";
import { Draggable, Droppable } from "react-beautiful-dnd";

const containerVariants = {
    closed: {
        width: "384px",
    },
    open: {
        width: "100%",
    },
}

export default function UserCardContainer({company_id}: {company_id: string}){
    const [searchTerm, setSearchTerm] = useState('');
    const {usersList, usersDisableDrop} = useTaskUserAssgnementContext()

    const filteredUsers = usersList.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return(
        <motion.div 
            className="flex flex-col gap-10"
            variants={containerVariants}
            initial="open"
            // animate={isOpen ? "closed" : "open"}
            transition={{ duration: 0.5 }}
        >
            <div className="w-[384px] flex gap-5 rounded-r-lg backdrop-blur z-10">
                <AddUserButton company_id={company_id}/>
                <Input
                    placeholder="Search User..."
                    size="sm"
                    className="w-full max-w-[300px] dark text-white"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                    variant="bordered"
                />
            </div>
            {
                usersList.length === 0 ? 
                <div className="text-white/50 text-center py-10 w-full">
                    No Users found.
                </div> :
                filteredUsers.length === 0 ? 
                <div className="text-white/50 text-center py-10 w-full">
                    No Users found.
                </div> :
                <Droppable  droppableId="users" isDropDisabled={usersDisableDrop}>
                {
                    (provided)=>(
                        <div
                            className="flex flex-col"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            {
                                filteredUsers.map((user, index) => (
                                    <Draggable key={user.id} draggableId={user.id} index={index}>
                                        {
                                            (provided) => {
                                                return (
                                                <div 
                                                    {...provided.dragHandleProps} 
                                                    {...provided.draggableProps} 
                                                    ref={provided.innerRef}
                                                    className="mb-5"
                                                >
                                                    <UserCard worker={user}/>
                                                </div>
                                            )
                                        }}
                                    </Draggable>
                                ))
                            }
                            {provided.placeholder}
                        </div>
                    )
                }
            </Droppable>
            }
        </motion.div>
    )
}