"use client";

import { Button, Divider, Input, Textarea } from "@heroui/react";
import { FaInfoCircle, FaShieldAlt } from "react-icons/fa";
import PermissionCard from "./PermissionCard";
import UserCardList from "./UserCardList";
import { useGroupsContext } from "../contexts/groupsProvider";
import { APP_PERMISSIONS as permissions } from "@/lib/constants";
import { useState } from "react";

export default function GroupsDetailsContainer() {
    const {selectedGroup, groups, setSelectedGroup, isOpen, setIsOpen} = useGroupsContext()
    let group = undefined;
    if(selectedGroup && isOpen) {
        group = groups.find((group) => group.id === selectedGroup)
    };

    const [groupName, setGroupName] = useState(group?.name || '');
    const [groupDescription, setGroupDescription] = useState(group?.description || '');
    const [groupPermissions, setGroupPermissions] = useState<string[]>(group?.permissions || []);
    // const [groupMembers, setGroupMembers] = useState(group?.members || []);

    return (
        <div className="flex-grow mt-[72px]">
            <div className="flex flex-col w-full border-2 rounded-lg border-white/20">
                <div className="p-4 border-b-1 bg-white/5 border-white/20 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {selectedGroup ? `Edit Group: ` : 'Create New Group'}
                        {selectedGroup && group && <span className="text-lg underline font-normal text-white/80">{group.name}</span>}
                    </h2>
                    <div className="flex gap-2 dark">
                        <Button
                            variant="light"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onPress={() => {
                                setSelectedGroup(null)
                                setIsOpen(false)
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-[#7dd5de] text-[#081e25] hover:bg-[#8ab0e0] transition-colors"
                        >
                            {selectedGroup ? 'Save' : 'Create'}
                        </Button>
                    </div>
                </div>
                <div className="p-4 text-white dark flex flex-col gap-4">
                    <h3 className="text-md font-medium text-white/80 flex items-center gap-2">
                        <FaInfoCircle className="w-4 h-4" />
                        Group Details
                    </h3>
                    <Input
                        type="text"
                        label="Group Name"
                        variant="bordered"
                        value={groupName}
                        onValueChange={setGroupName}
                    />
                    <Textarea
                        label="Group Description"
                        variant="bordered"
                        minRows={5}
                        maxRows={10}
                        value={groupDescription}
                        onValueChange={setGroupDescription}
                    />
                </div>
                <Divider className="bg-white/20" />
                <div className="p-4 text-white dark flex flex-col gap-4">
                    <h3 className="text-md font-medium text-white/80 flex items-center gap-2">
                        <FaShieldAlt className="w-4 h-4" />
                        Group Permissions
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {permissions.map((permission, index) => (
                            <PermissionCard
                                key={index}
                                permission={permission}
                                is_active={groupPermissions.includes(permission)}
                                onPermissionChange={(id, is_active) => {
                                    if(is_active){
                                        setGroupPermissions([...groupPermissions, id]);
                                    }
                                    else{
                                        setGroupPermissions(groupPermissions.filter((p) => p !== id));
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
                <Divider className="bg-white/20" />
                <UserCardList
                    currentMembers={[
                        {
                            id: "1",
                            name: "Bob Johnson",
                            email: "bob@example.com",
                            initial: "B"
                        }
                    ]}
                    availableUsers={[
                        {
                            id: "2",
                            name: "Alice Brown",
                            email: "alice@example.com",
                            initial: "A"
                        },
                        {
                            id: "3",
                            name: "Charlie Wilson",
                            email: "charlie@example.com",
                            initial: "C"
                        },
                        {
                            id: "4",
                            name: "Diana Miller",
                            email: "diana@example.com",
                            initial: "D"
                        }
                    ]}
                    onSearch={(query) => {
                        console.log(`Searching for: ${query}`);
                    }}
                    onAddUser={(userId) => {
                        console.log(`Adding user: ${userId}`);
                    }}
                    onRemoveUser={(userId) => {
                        console.log(`Removing user: ${userId}`);
                    }}
                />
            </div>
        </div>
    )
}
