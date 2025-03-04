"use client"
import { Button, Card, CardBody, cn, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react"
import { useGroupsContext } from "../contexts/groupsProvider"
import { GroupIcon, Edit, MoreVertical, Trash } from "lucide-react"
import { Group } from "../types/groupsTypes"

export default function GroupCard({group}:{group:Group}){
    const {setSelectedGroup, selectedGroup, setIsOpen} = useGroupsContext()
    return(
        <Card
            className={cn(
                "w-96 h-48 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 group border border-white/20",
                selectedGroup === group.id && "bg-white/10 border-white/50"
            )}
            isPressable
            onPress={() => {
                    window.scrollTo({
                        top: 0,
                        behavior: 'smooth',
                    });
                    setSelectedGroup(group.id)
                    setIsOpen(true)
                }}
            >
            <CardBody className="p-6 flex flex-col justify-between overflow-hidden">
                {/* Top section */}
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                        <GroupIcon className="w-5 h-5 text-[#8ab0e0]" />
                        <h2 className="text-lg font-semibold text-white line-clamp-1 max-w-[250px] break-words">
                            {group.name}
                        </h2>
                        </div>
                        <Dropdown>
                        <DropdownTrigger>
                            <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light" 
                            className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                            <MoreVertical className="w-5 h-5" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Database actions">
                            <DropdownItem 
                                key="edit" 
                                startContent={<Edit className="w-4 h-4" />}
                            >
                                Edit
                            </DropdownItem>
                            <DropdownItem 
                                key="delete" 
                                startContent={<Trash className="w-4 h-4" />}
                                className="text-danger"
                                color="danger"
                            >
                                Delete
                            </DropdownItem>
                        </DropdownMenu>
                        </Dropdown>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2 break-words">
                        {group.description}
                    </p>
                </div>
                {/* Bottom section */}
                <div className="space-y-1.5">
                    <p className="flex items-center gap-2 text-sm text-white/60">
                        <span>Members:</span>
                        <span className="truncate text-sm">
                            {group.members_count}
                        </span>
                    </p>
                    <p className="flex items-center gap-2 text-sm text-white/60">
                        <span>Created:</span>
                        <time dateTime={group.created_at}>
                            {new Date(group.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                            })}
                        </time>
                    </p>
                </div>
            </CardBody>
        </Card>
    )
}