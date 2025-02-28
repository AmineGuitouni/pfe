"use client"
import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input
} from "@heroui/react";
import { toast } from "react-toastify";

export default function DatabaseDeleteConfirmation({ 
  databaseName, 
  onConfirmDelete,
  isOpen,
  onClose
}:{
  databaseName: string;
  onConfirmDelete?: () => Promise<void>;
  isOpen: boolean;
  onClose?: () => void;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const handleConfirmDelete = async () => {
    if (confirmText !== databaseName){
      toast.error("Confirmation text does not match the database name. Please try again.");
      return
    }
    
    try {
      setIsLoading(true);
      await onConfirmDelete?.();
      onClose?.();
    } catch (error) {
      console.error("Error deleting database:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDeleteDisabled = confirmText !== databaseName;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" className="bg-modal_bg dark border-1 border-white/20 text-white">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-red-600">
              Delete Database Confirmation
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <p>To confirm, please type the database name: <strong>{databaseName}</strong></p>
                
                <Input
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder={`Type "${databaseName}" to confirm`}
                  className={isDeleteDisabled ? "" : "border-red-500 focus:border-red-500"}
                />
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                color="danger" 
                onPress={handleConfirmDelete} 
                disabled={isDeleteDisabled || isLoading}
                isLoading={isLoading}
              >
                Delete Database
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}