"use client";

import { Button, Divider, Input, Textarea } from "@heroui/react";
import { useGroupsContext } from "../contexts/groupsProvider";

export default function GroupsDetailsContainer() {
    const {selectedGroup, groups, setSelectedGroup} = useGroupsContext()

    if(!selectedGroup) return null;

    const group = groups.find((group) => group.id === selectedGroup)

    if(!group) return null;

    const editMode = true;

    return (
        <div className="flex-grow">
            <div className="flex flex-col w-full border-2 rounded-lg border-white/20">
                <div className="p-4 border-b-1 bg-white/5 border-white/20 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {editMode ? `Edit Group: ` : 'Create New Group'}
                        {editMode && <span className="text-lg underline font-normal text-white/80">{group.name}</span>}
                    </h2>
                    <div className="flex gap-2 dark">
                        <Button
                            variant="bordered"
                            color="danger"
                            onPress={()=>{
                                setSelectedGroup(null)
                            }}
                        >
                            Close
                        </Button>
                        <Button
                            variant="solid"
                            color="success"
                        >
                            Save
                        </Button>
                    </div>
                </div>
                <div className="p-4 text-white dark flex flex-col gap-4">
                    <h3 className="text-md font-medium text-white/80">Group Details</h3>
                    <Input
                        type="text"
                        label="Group Name"
                        variant="bordered"
                        value={group.name}
                    />
                    <Textarea
                        label="Group Description"
                        variant="bordered"
                        value={group.description}
                        minRows={5}
                        maxRows={10}
                    />
                </div>
                <Divider className="bg-white/20" />
                <div className="p-4 text-white dark flex flex-col gap-4">
                    <h3 className="text-md font-medium text-white/80">Group Details</h3>
                    <Input
                        type="text"
                        label="Group Name"
                        variant="bordered"
                        value={group.name}
                    />
                    <Textarea
                        label="Group Description"
                        variant="bordered"
                        value={group.description}
                        minRows={5}
                        maxRows={10}
                    />
                </div>
            </div>
        </div>
    )
}