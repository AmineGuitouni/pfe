"use client"
import { motion } from "framer-motion";
import { Button, Input } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import AddUserButton from "./AddUserButton";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";
import { UserCard, UserCardSkeleton } from "./usersCard";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import SaveAssignementButton from "./saveAssignementButton";
import { RiGeminiLine } from "react-icons/ri";

const containerVariants = {
    closed: {
        width: "384px",
    },
    open: {
        width: "100%",
    },
}

export default function UserCardContainer({company_id, project_id}: {company_id: string, project_id: string}){
    const [searchTerm, setSearchTerm] = useState('');
    const {usersList, usersDisableDrop, loadingTaskUserLinks, getAiTaskLinks} = useTaskUserAssgnementContext()

    const filteredUsers = usersList.filter(user => 
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return(
        <motion.div 
            className="flex flex-col gap-5 h-full overflow-hidden"
            variants={containerVariants}
            initial="open"
            // animate={isOpen ? "closed" : "open"}
            transition={{ duration: 0.5 }}
        >
            <div className="w-full flex justify-between gap-5 rounded-r-lg backdrop-blur z-10 flex-shrink-0">
                <div className="w-[384px] flex items-center gap-3">
                    <Button
                        size="sm"
                        className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0"
                        startContent={<RiGeminiLine className="w-4 h-4" />}
                        onPress={()=>{
                            getAiTaskLinks();
                        }}
                    >
                        Ai Generate
                    </Button>
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
                <SaveAssignementButton company_id={company_id} project_id={project_id}/>
            </div>
            <div className="flex-1 overflow-y-auto">
            {
                loadingTaskUserLinks ? 
                <div className="text-white/50 text-center py-10 w-full flex flex-col gap-4">
                    {
                        Array.from({ length: 3 }).map((_, index) => (
                            <UserCardSkeleton key={index} />
                        ))
                    }
                </div> :
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
                                            (provided, snapshot) => {
                                                return (
                                                <div 
                                                    {...provided.dragHandleProps} 
                                                    {...provided.draggableProps} 
                                                    ref={provided.innerRef}
                                                    className="mb-5"
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        zIndex: snapshot.isDragging ? 9999 : 'auto',
                                                    }}
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
            </div>
        </motion.div>
    )
}