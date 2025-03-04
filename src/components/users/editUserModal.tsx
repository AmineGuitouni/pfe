"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Input,
} from "@heroui/react";
import { useState } from "react";
import { User } from "./types";

export default function EditModal({
    isOpen, 
    onOpenChange, 
    user, 
    editUser
}: {
    isOpen: boolean, 
    onOpenChange: (isOpen: boolean) => void,
    user: User,
    editUser: (updatedUser: User) => Promise<null | undefined>,
}) {
    const [loading, setLoading] = useState(false);
    const [editedUser, setEditedUser] = useState(user);
    const [error, setError] = useState('');

    const handleSubmit = async (onClose: () => void) => {
        setLoading(true);
        setError('');

        // Basic validation
        if (!editedUser.first_name || !editedUser.last_name || !editedUser.email) {
            setError('First name, last name, and email are required');
            setLoading(false);
            return;
        }

        try {
            await editUser(editedUser);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "pt-6",
                closeButton: "text-white/60 hover:text-white/10"
            }} 
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            Edit {user.first_name}`s details
                        </ModalHeader>
                        <ModalBody className="mb-3">
                            <form 
                                className="flex flex-col gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit(onClose);
                                }}
                            > 
                                {error && (
                                    <div className="text-red-500 text-sm mb-2">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-between items-center w-full gap-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">First Name</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        onValueChange={(value) => {
                                            setEditedUser({ ...editedUser, first_name: value })
                                            if(error) setError('')
                                        }}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={editedUser.first_name}
                                        placeholder={user.first_name}
                                        required
                                    />
                                </div>

                                <div className="flex justify-between items-center w-full gap-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">Last Name</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        onValueChange={(value) => {
                                            setEditedUser({ ...editedUser, last_name: value })
                                            if(error) setError('')
                                        }}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={editedUser.last_name}
                                        placeholder={user.last_name}
                                        required
                                    />
                                </div>

                                <div className="flex justify-between items-center w-full gap-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">Email</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        type="email"
                                        onValueChange={(value) => {
                                            setEditedUser({ ...editedUser, email: value })
                                            if(error) setError('')
                                        }}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={editedUser.email}
                                        placeholder={user.email}
                                        required
                                    />
                                </div>

                                <div className="flex justify-between items-center w-full gap-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">Country</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        onValueChange={(value) => {
                                            setEditedUser({ ...editedUser, country: value })
                                            if(error) setError('')
                                        }}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={editedUser.country}
                                        placeholder={user.country}
                                    />
                                </div>

                                <div className="flex justify-between items-center w-full gap-3 mb-2">
                                    <span className="text-white/60 text-sm flex-shrink-0">Phone number</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        onValueChange={(value) => {
                                            setEditedUser({ ...editedUser, phone_number: value })
                                            if(error) setError('')
                                        }}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={editedUser.phone_number}
                                        placeholder={user.phone_number}
                                    />
                                </div>
                                
                                <div className="flex justify-end gap-2 w-full">
                                    <Button
                                        variant="light"
                                        onPress={onClose}
                                        className="text-white/60 dark hover:text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        isLoading={loading}
                                        isDisabled={loading}
                                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                                    >
                                        Edit
                                    </Button>
                                </div>
                            </form> 
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}