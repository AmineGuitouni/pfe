"use client";

import { Button, Divider, Input, ScrollShadow, Textarea } from "@heroui/react";
import { FaInfoCircle, FaShieldAlt } from "react-icons/fa";
import PermissionCard from "./PermissionCard";
import UserCardList from "./UserCardList";
import { useGroupsContext } from "../contexts/groupsProvider";
import { APP_PERMISSIONS as permissions } from "@/lib/constants";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useUsers } from "@/components/users/hooks/useUsers";
import { User } from "@/components/users/types";
import { toast } from "react-toastify";

export default function GroupsDetailsContainer({company}:{company: string}) {
    const {selectedGroup, groups, setSelectedGroup, isOpen, setIsOpen, addGroup, getGroupUsersDetails, updateGroup} = useGroupsContext()
    const [actionLoading, setActionLoading] = useState(false)

    const {
        users,
        loading,
        searchText,
        setSearchText,
        setExcludedUsers
    } = useUsers(company)
    
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupPermissions, setGroupPermissions] = useState<string[]>([]);
    const [groupMembers, setGroupMembers] = useState<User[]>([]);

    useEffect(()=>{
        const group = groups.find((group) => group.id === selectedGroup)

        if(group){
            setGroupName(group.name)
            setGroupDescription(group.description)
            setGroupPermissions(group.permissions)
            setExcludedUsers(group.members)

            getGroupUsersDetails(group.members)
            .then((group_users)=>{
                setGroupMembers(group_users)
            })
        }
        else{
            setGroupName('')
            setGroupDescription('')
            setGroupPermissions([])
        }
    },[selectedGroup, groups, setExcludedUsers, getGroupUsersDetails])

    const onSave = async () =>{
        if(!selectedGroup) return

        setActionLoading(true)

        try{
            await updateGroup({
                id: selectedGroup!,
                name: groupName,
                description: groupDescription,
                permissions: groupPermissions,
                users: groupMembers.map((user) => user.id)
            })
        }
        catch(err){
            console.log(err)
        }
        finally{
            setActionLoading(false)
        }
    }

    const onCreate = async()=>{
        setActionLoading(true)
        try{
            await addGroup({
                name: groupName,
                description: groupDescription,
                permissions: groupPermissions,
                users: groupMembers.map((user) => user.id)
            })

            setGroupName('')
            setGroupDescription('')
            setGroupPermissions([])
            setGroupMembers([])
            
            setIsOpen(false)
        }
        catch(err){
            console.log(err)
            toast.error("Something went wrong")
        }
        finally{
            setActionLoading(false)
        }
    }

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedGroup) {
            onSave()
        } else {
            onCreate()
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: isOpen ? 1 : 0, width: isOpen ? undefined : 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[calc(100%-404px)] flex-grow mt-[72px] sticky top-12 h-fit"
        >
            <form onSubmit={onSubmit} className="flex flex-col w-full border-2 rounded-lg border-white/20 max-h-[calc(100vh-150px)]">
                <div className="p-4 border-b-1 bg-white/5 border-white/20 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-white">
                        {selectedGroup ? `Edit Group: ` : 'Create New Group'}
                        {selectedGroup && <span className="text-lg underline font-normal text-white/80">{groupName}</span>}
                    </h2>
                    <div className="flex gap-2 dark">
                        <Button
                            variant="light"
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onPress={() => {
                                setSelectedGroup(null)
                                setIsOpen(false)
                            }}
                            isDisabled={actionLoading}
                            isLoading={actionLoading}
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
                <ScrollShadow className="overflow-y-auto h-full w-full">
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
                    currentMembers={groupMembers}
                    availableUsers={users}
                    searchValue={searchText}
                    onSearch={setSearchText}
                    onAddUser={(userId) => {
                        if(groupMembers.find((user) => user.id === userId)) return;
                        setGroupMembers(prev=>[...prev, users.find((user) => user.id === userId)!])
                        setExcludedUsers(prev=>[...prev, userId])
                    }}
                    onRemoveUser={(userId) => {
                        setGroupMembers(groupMembers.filter((user) => user.id !== userId))
                        setExcludedUsers(prev=>prev.filter((user) => user !== userId))
                    }}
                    isloading={loading && users.length === 0}
                />
                </ScrollShadow>
            </form>
        </motion.div>
    )
}
