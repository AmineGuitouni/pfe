"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Alert,
} from "@heroui/react";
import { useState } from "react";

export default function DeleteModal({isOpen, onOpenChange,userName,id,deleteUser}:{isOpen: boolean, onOpenChange: (isOpen: boolean) => void, userName: string, id: string,deleteUser: (userId: string) => Promise<void>}) {

    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try{
            await deleteUser(id);
            onOpenChange(false);
        }
        catch(error){
            console.error("Error deleting user:", error);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <>
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                classNames={{
                    base: "bg-modal_bg border rounded-lg border-white/20",
                    header: "text-light_blue-500 border-b border-white/20",
                    body: "pt-6",
                    closeButton: "text-white/60 hover:text-white/80"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger-500">Delete {userName}</ModalHeader>
                            <ModalBody className="flex flex-col gap-4">
                            <p className="text-white/60">
                            Are you sure you want to remove this worker from the company? This action will revoke their access to all company resources and data. Once removed, their profile and associated information will no longer be accessible.
                                </p>

                                <Alert 
                                    radius="sm" 
                                    color="danger" 
                                    className="dark" 
                                    description="Removing this worker is irreversible. All their data and access will be permanently revoked. Please confirm this action carefully." 
                                    title="Important Notice" 
                                />

                                
                            </ModalBody>
                            <ModalFooter className="flex items-center gap-4">
                                <Button 
                                    className="text-light_blue dark" 
                                    variant="light" 
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    radius="sm" 
                                    isDisabled={loading} 
                                    isLoading={loading}
                                    onPress={handleDelete}
                                    color="danger" 
                                    variant="solid" 
                                    className="text-danger-500 bg-danger-500/30 font-semibold"
                                >
                                    Delete {userName.split(" ")[0]}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}