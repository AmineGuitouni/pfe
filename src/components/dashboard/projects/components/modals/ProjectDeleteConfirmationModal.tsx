"use client"
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button
} from "@heroui/react";
import { toast } from "react-toastify";

interface ProjectDeleteConfirmationProps {
  projectName: string;
  onConfirmDelete?: () => Promise<void>;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ProjectDeleteConfirmation({ 
  projectName,
  onConfirmDelete,
  isOpen,
  onOpenChange
}: ProjectDeleteConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirmDelete = async (onClose: () => void) => {
    try {
      setIsLoading(true);
      await onConfirmDelete?.();
      onClose();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md" className="bg-modal_bg dark border-1 border-white/20 text-white">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-red-600">
              Delete Project Confirmation
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <p>Are you sure you want to delete the project &quot;{projectName}&quot;?</p>
                <p className="text-red-500">This action cannot be undone.</p>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={()=>{handleConfirmDelete(onClose)}}
                isLoading={isLoading}
              >
                Delete Project
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}