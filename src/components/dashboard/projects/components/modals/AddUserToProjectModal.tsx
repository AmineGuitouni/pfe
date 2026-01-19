"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Checkbox, Avatar, Spinner } from "@heroui/react"
import { useState, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User } from "@/components/users/types/types"
import { IoSearchOutline } from "react-icons/io5"
import { FiUser } from "react-icons/fi"

interface AddUserToProjectModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    company_id: string;
    existingUserIds: string[];
    onAddUsers: (users: User[]) => void;
}

export default function AddUserToProjectModal({
    isOpen,
    onOpenChange,
    company_id,
    existingUserIds,
    onAddUsers,
}: AddUserToProjectModalProps) {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Fetch available users
    const fetchUsers = useCallback(async () => {
        if (!session?.user.id || !isOpen) return;

        try {
            setIsLoading(true);
            const response = await fetch(
                `/api/v1/${session.user.id}/companies/${company_id}/users`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const result = await response.json();
            // Filter out already assigned users
            const availableUsers = (result.data || []).filter(
                (user: User) => !existingUserIds.includes(user.id)
            );
            setUsers(availableUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user.id, company_id, existingUserIds, isOpen]);

    useEffect(() => {
        if (isOpen) {
            fetchUsers();
            setSelectedUsers(new Set());
            setSearchTerm("");
        }
    }, [isOpen, fetchUsers]);

    const filteredUsers = users.filter(user =>
        user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleToggleUser = (userId: string) => {
        setSelectedUsers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const handleSubmit = async () => {
        if (selectedUsers.size === 0) return;

        setIsAdding(true);
        try {
            const usersToAdd = users.filter(u => selectedUsers.has(u.id));
            onAddUsers(usersToAdd);
            onOpenChange(false);
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            radius="sm"
            size="lg"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "py-4",
                closeButton: "text-white/60 hover:text-white/80"
            }}
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Add Workers to Project
                        </ModalHeader>

                        <ModalBody>
                            <Input
                                placeholder="Search workers..."
                                size="sm"
                                className="w-full dark text-white mb-4"
                                value={searchTerm}
                                onValueChange={setSearchTerm}
                                endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                                variant="bordered"
                            />

                            {isLoading ? (
                                <div className="flex justify-center py-8">
                                    <Spinner size="lg" />
                                </div>
                            ) : filteredUsers.length === 0 ? (
                                <div className="text-center py-8 text-white/50">
                                    {users.length === 0
                                        ? "No available workers to add"
                                        : "No workers match your search"
                                    }
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                        <span className="text-white/60 text-sm">
                                            {selectedUsers.size} selected
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="light"
                                            className="text-light_blue"
                                            onPress={handleSelectAll}
                                        >
                                            {selectedUsers.size === filteredUsers.length
                                                ? "Deselect All"
                                                : "Select All"
                                            }
                                        </Button>
                                    </div>

                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                                    selectedUsers.has(user.id)
                                                        ? "bg-light_blue/10 border-light_blue/30"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10"
                                                }`}
                                                onClick={() => handleToggleUser(user.id)}
                                            >
                                                <Checkbox
                                                    isSelected={selectedUsers.has(user.id)}
                                                    onValueChange={() => handleToggleUser(user.id)}
                                                    classNames={{
                                                        wrapper: "before:border-white/40",
                                                    }}
                                                />
                                                <Avatar
                                                    size="sm"
                                                    name={`${user.first_name} ${user.last_name}`}
                                                    className="w-8 h-8"
                                                    fallback={<FiUser className="text-light_blue-400" />}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium text-sm truncate">
                                                        {user.first_name} {user.last_name}
                                                    </h4>
                                                    <p className="text-white/50 text-xs truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                                radius="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSubmit}
                                isLoading={isAdding}
                                isDisabled={selectedUsers.size === 0}
                                className="bg-light_blue text-black font-semibold"
                                radius="sm"
                            >
                                Add {selectedUsers.size > 0 ? `(${selectedUsers.size})` : ""} Workers
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
