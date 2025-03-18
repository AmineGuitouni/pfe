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
interface TaskDeleteConfirmationProps {
  tasks: string[];
  onConfirmDelete?: () => void;
  isOpen: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export default function TaskDeleteConfirmation({ 
  tasks,
  onConfirmDelete,
  isOpen,
  onOpenChange
}: TaskDeleteConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirmDelete = async (onClose: () => void) => {
    try {
      setIsLoading(true);
      await onConfirmDelete?.();
      onClose();
    } catch (error) {
      console.error("Error deleting tasks:", error);
      toast.error("Failed to delete tasks");
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
              Delete Task Confirmation
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <p>Are you sure you want to delete the following tasks?</p>
                <ul className="list-disc pl-4">
                  {tasks.map((task, index) => (
                    <li key={index}>{task}</li>
                  ))}
                </ul>
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
                Delete Tasks
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}