"use client";
import { useState, useEffect, useMemo } from 'react';
import {
    Input,
    Button,
    Spinner,
    Dropdown,      
    DropdownTrigger,
    DropdownMenu,
    DropdownItem, 
    ScrollShadow,  
    Avatar,        
} from '@heroui/react';
import { useUsers } from '@/components/users/hooks/useUsers';
import { User } from '@/components/users/types/types';
import { toast } from 'react-toastify';
import { FaSearch, FaUserCircle, FaEye, FaPencilAlt, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import { AccessLevel } from '../types/filesTypes';
import { useFilesContext } from '../hooks/useFilesContext';

// Define the structure for user access
interface UserAccess {
    userId: string;
    fullName: string; 
    email: string;
    // avatarUrl?: string; // Removed as not available in User type
    accessLevel: AccessLevel; 
}

interface ManageUserAccessProps {
    onClose?: () => void;
    fileId: string;
    companyId: string;
}

export default function ManageUserAccess({
    onClose,
    fileId,
    companyId,
}: ManageUserAccessProps) {
    const [currentAccessList, setCurrentAccessList] = useState<UserAccess[]>([]);
    const [initialAccessList, setInitialAccessList] = useState<UserAccess[]>([]);
    const [isLoadingAccessList, setIsLoadingAccessList] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const {getFileAccessList, editFileAccess} = useFilesContext();

    // --- User Fetching ---
    const {
        users: availableUsers,
        loading: isLoadingAvailableUsers,
        searchText,
        setSearchText,
        setExcludedUsers,
    } = useUsers(companyId);

    const userToShowAsAvailable = useMemo(()=>{
        return availableUsers.filter(user => {
            return currentAccessList.every(ua => ua.userId !== user.id);
        })
    }, [availableUsers, currentAccessList])

    useEffect(()=>{
        setIsLoadingAccessList(true);
        getFileAccessList(fileId).then((data)=>{
            const accessList = data.map((accessItem) => ({
                userId: accessItem.user.userId,
                fullName: accessItem.user.fullName,
                email: accessItem.user.email,
                accessLevel: accessItem.access_level
            }))

            setCurrentAccessList(accessList);
            setInitialAccessList(accessList);
            setExcludedUsers(accessList.map(ua => ua.userId));
        }).finally(()=>{
            setIsLoadingAccessList(false);
        })
    },[getFileAccessList, fileId, setExcludedUsers])

    // --- Action Handlers (Placeholders) ---
    const handleAddUserAccess = (user: User, accessLevel: 'viewer' | 'editor') => { // Updated type hint
        console.log("Adding user:", user.id, "with access:", accessLevel);
        const newUserAccess = { userId: user.id, fullName: `${user.first_name} ${user.last_name}`, email: user.email, accessLevel };
        setCurrentAccessList(prev => {
            const newList = [...prev, newUserAccess];
            // Update excluded users after state update
            setExcludedUsers(newList.map(ua => ua.userId));
            return newList;
        });
    };

    const handleRemoveUserAccess = (userId: string) => {
        console.log("Removing user:", userId);
        setCurrentAccessList(prev => {
            const newList = prev.filter(ua => ua.userId !== userId);
            setExcludedUsers(newList.map(ua => ua.userId));
            return newList;
        });
    };

    const handleChangeAccessLevel = (userId: string, newAccessLevel: 'viewer' | 'editor') => { // Updated type hint
        console.log("Changing access for user:", userId, "to:", newAccessLevel);
        setCurrentAccessList(prev =>
            prev.map(ua => ua.userId === userId ? { ...ua, accessLevel: newAccessLevel } : ua)
        );
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError(null);
        console.log("Saving changes:", currentAccessList);
        try {
            // Determine users to remove: those in initial list but not in current list
            const userToRemove: { user_id: string }[] = initialAccessList
                .filter(initialUser => !currentAccessList.some(currentUser => currentUser.userId === initialUser.userId))
                .map(user => ({ user_id: user.userId }));

            // Determine users to add or update: those in current list but not in initial, or with changed access level
            const userToAdd: { user_id: string, access_level: AccessLevel }[] = currentAccessList
                .filter(currentUser => {
                    const initialUser = initialAccessList.find(iu => iu.userId === currentUser.userId);
                    // Add if user is new OR if access level has changed
                    return !initialUser || initialUser.accessLevel !== currentUser.accessLevel;
                })
                .map(user => ({ user_id: user.userId, access_level: user.accessLevel }));

            // Only call API if there are actual changes
            if (userToAdd.length > 0 || userToRemove.length > 0) {
                 await editFileAccess(fileId, userToAdd, userToRemove);
                 toast.success("Access permissions updated successfully!");
            } else {
                 toast.info("No changes detected.");
            }

            onClose?.();
        } catch (err: any) {
            console.error("Error saving access list:", err);
            const message = err.message || "Failed to save changes.";
            setError(message);
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Search Input */}
            <Input
                isClearable
                placeholder="Search users to add..."
                variant="bordered"
                className="dark text-white"
                value={searchText}
                onValueChange={setSearchText}
                startContent={<FaSearch className="text-white/50 mr-1" />} // Added search icon
                disabled={isSaving}
            />

            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

            {/* User Lists Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[50vh]"> {/* Increased gap */}

                {/* Current Access List */}
                <div className="flex flex-col gap-2">
                    <h4 className="text-md font-semibold text-light_blue border-b border-white/10 pb-1 mb-1"> {/* Use light_blue */}
                        Current Access
                    </h4>
                    <ScrollShadow hideScrollBar className="flex-grow h-[40vh] pr-2"> {/* Added ScrollShadow */}
                        {isLoadingAccessList ? (
                            <div className="flex justify-center items-center h-full">
                                <Spinner size="md" color="primary"/>
                            </div>
                        ) : currentAccessList.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center mt-4">No users currently have access.</p>
                        ) : (
                            currentAccessList.map(userAccess => (
                                <div key={userAccess.userId} className="flex items-center justify-between gap-2 p-2 hover:bg-white/10 rounded transition-colors duration-150">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                        <Avatar icon={<FaUserCircle className="text-white/60"/>} size="sm" className="flex-shrink-0"/>
                                        <div className="flex flex-col text-sm min-w-0">
                                            <span className="font-medium text-white truncate" title={userAccess.fullName}>{userAccess.fullName}</span>
                                            <span className="text-xs text-gray-400 truncate" title={userAccess.email}>{userAccess.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button
                                                    size="sm"
                                                    variant="bordered"
                                                    className="text-xs capitalize border-white/30 text-white/80"
                                                    isDisabled={isSaving}
                                                >
                                                    {userAccess.accessLevel}
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                aria-label="Change access level"
                                                disabledKeys={[userAccess.accessLevel]} // Disable current level
                                                onAction={(key) => handleChangeAccessLevel(userAccess.userId, key as 'viewer' | 'editor')}
                                            >
                                                <DropdownItem key="viewer" startContent={<FaEye className="w-4 h-4 text-default-700"/>}>Viewer</DropdownItem>
                                                <DropdownItem key="editor" startContent={<FaPencilAlt className="w-4 h-4 text-default-700"/>}>Editor</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            className="text-red-500/80 hover:text-red-500 hover:bg-red-500/10" // Danger styling
                                            onPress={() => handleRemoveUserAccess(userAccess.userId)}
                                            isDisabled={isSaving}
                                            aria-label="Remove access"
                                        >
                                            <FaTrashAlt size={16}/>
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollShadow>
                </div>

                {/* Available Users List */}
                <div className="flex flex-col gap-2">
                    <h4 className="text-md font-semibold text-light_blue border-b border-white/10 pb-1 mb-1"> {/* Use light_blue */}
                        Add Users
                    </h4>
                    <ScrollShadow hideScrollBar className="flex-grow h-[40vh] pr-2"> {/* Added ScrollShadow */}
                        {isLoadingAccessList && isLoadingAvailableUsers && availableUsers.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <Spinner size="md" color="primary"/>
                            </div>
                        ) : availableUsers.length === 0 && searchText ? (
                                <p className="text-sm text-gray-400 italic text-center mt-4">No users found matching &quot;{searchText}&quot;.</p>
                        ) : availableUsers.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center mt-4">No other users available to add.</p>
                        ) : (
                            userToShowAsAvailable.map(user => (
                                <div key={user.id} className="flex items-center justify-between gap-2 p-2 hover:bg-white/10 rounded transition-colors duration-150">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                        <Avatar icon={<FaUserCircle className="text-white/60"/>} size="sm" className="flex-shrink-0"/>
                                        <div className="flex flex-col text-sm min-w-0">
                                            <span className="font-medium text-white truncate" title={`${user.first_name} ${user.last_name}`}>{`${user.first_name} ${user.last_name}`}</span>
                                            <span className="text-xs text-gray-400 truncate" title={user.email}>{user.email}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button
                                                    size="sm"
                                                    variant="flat"
                                                    className="text-xs bg-light_blue-500/20 text-light_blue-500 hover:bg-light_blue-500/30" // Accent color
                                                    startContent={<FaUserPlus size={14}/>}
                                                    isDisabled={isSaving}
                                                >
                                                    Add
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu
                                                aria-label="Add user with access level"
                                                onAction={(key) => handleAddUserAccess(user, key as 'viewer' | 'editor')}
                                            >
                                                <DropdownItem key="viewer" startContent={<FaEye className="w-4 h-4 text-default-700"/>}>As Viewer</DropdownItem>
                                                <DropdownItem key="editor" startContent={<FaPencilAlt className="w-4 h-4 text-default-700"/>}>As Editor</DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                </div>
                            ))
                        )}
                    </ScrollShadow>
                </div>
            </div>

            <div className="flex justify-end gap-2 w-full mt-4 pt-4 border-t border-white/10">
                <Button
                    variant="light"
                    onPress={() => onClose?.()}
                    className="text-white/60 dark hover:text-white hover:bg-white/10"
                    disabled={isSaving}
                >
                    Cancel
                </Button>
                <Button
                    isLoading={isSaving}
                    isDisabled={isSaving || isLoadingAccessList} // Disable if loading initial list too
                    onPress={handleSaveChanges}
                    className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                >
                    Save Changes
                </Button>
            </div>
        </div>
    );
}