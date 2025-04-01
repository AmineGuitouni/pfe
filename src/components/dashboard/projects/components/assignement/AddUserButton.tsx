"use client"
import { UserCard, UserCardSkeleton } from "@/components/dashboard/groups/components/UserCard";
import { useUsers } from "@/components/users/hooks/useUsers";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { Plus } from "lucide-react";
import { IoSearchOutline } from "react-icons/io5";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";

export default function AddUserButton({company_id}: {company_id: string}) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const {addUsers} = useTaskUserAssgnementContext()
    const {
        loading, 
        users,
        setExcludedUsers,
        excludedUsers,
        searchText:searchTerm, 
        setSearchText:setSearchTerm
    } = useUsers(company_id);

    const onUserAdd = (userId:string) => {
        addUsers([users.find(user => user.id === userId)!]);
        setExcludedUsers(prev=> [...prev, userId]);
    }

    return (
        <>
        <Button
            size="sm"
            className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0"
            startContent={<Plus className="w-4 h-4" />}
            onPress={onOpen}
        >
            Add Users
        </Button>
        <Modal
            isOpen={isOpen}
            radius="sm"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "pt-6",
                closeButton: "text-white/60 hover:text-white/80"
            }}
            onOpenChange={onOpenChange}
            >
            <ModalContent>
                {(onClose) => (
                    <>
                    <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                        Add Users
                    </ModalHeader>
    
                    <ModalBody className="flex flex-col gap-4 text-white">
                        <Input
                            placeholder="Search User..."
                            size="sm"
                            className="w-full max-w-[300px] dark text-white"
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                            endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                            variant="bordered"
                        />
                        {
                            loading && users.length === 0 ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <UserCardSkeleton key={index} />
                                ))
                            ):
                            users.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center w-full my-8">No users found</p>
                            ):
                            users.filter((user)=> !excludedUsers.includes(user.id)).map((user)=>(
                                <UserCard key={user.id} user={user} variant="add" onAction={onUserAdd} />
                            ))
                            
                        }
                    </ModalBody>
    
                    <ModalFooter>
                    <Button
                        variant="light"
                        onPress={onClose}
                        className="text-white/60 dark hover:text-white hover:bg-white/10"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        isDisabled={loading}
                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                    >
                        Submit
                    </Button>
                    </ModalFooter>
                    </>
                )}
            </ModalContent>
            </Modal>
        </>
    );
}