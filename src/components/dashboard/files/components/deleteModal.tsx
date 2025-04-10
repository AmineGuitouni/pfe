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
import { FileItem, FolderItem } from "../types/filesTypes";
import { useFilesContext } from "../hooks/useFilesContext";

export default function DeleteModal({isOpen, onOpenChange , object}:{isOpen: boolean, onOpenChange?: (isOpen: boolean) => void, object : FolderItem | FileItem}) {

    const [loading, setLoading] = useState(false);
    const {deleteFolder} = useFilesContext();

    const type: "file" | "folder" = "type" in object ? "file" : "folder"

    const handleDelete = async () => {
        try{
            setLoading(true);
            if(type === "file"){

            }
            else {
                await deleteFolder(object.id);
            }
            
            onOpenChange?.(false);
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
                            <ModalHeader className="flex flex-col gap-1 text-danger-500">Delete {object.name}</ModalHeader>
                            <ModalBody className="flex flex-col gap-4">

                                <Alert 
                                    radius="sm" 
                                    color="danger" 
                                    className="dark" 
                                    description={`Are you sure you want to remove this ${type} from the files ?`}
                                    title="Warning" 
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
                                    Delete {object.name}
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}