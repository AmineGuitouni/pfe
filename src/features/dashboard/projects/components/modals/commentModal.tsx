"use client"
import { Button, Modal, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Task } from "../../types";
import CommentContainer from "@/features/to-do/components/taskComponents/taskModalComponents/commentContainer";

export default function CommentModal({ 
    isOpen, 
    onOpenChange, 
    task,
    project_id
}: { 
    isOpen: boolean, 
    onOpenChange: (isOpen: boolean) => void,
    task: Task,
    project_id : string
}) {
    return (
        <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        radius="sm" 
        size="3xl"
        classNames={{
          base: "bg-modal_bg border rounded-lg border-white/20 text-white/80 overflow-x-hidden",
          header: "text-light_blue-500 border-b border-white/20",
          body: "py-4",
          closeButton: "text-white/60 hover:text-white/80"
        }} 
      >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="text-sm text-light_blue-500/50 hover:underline">
                            Comments
                        </ModalHeader>
                        <CommentContainer task_id={task.id} project_id={project_id} />
                        <ModalFooter className="flex justify-end">
                            <Button 
                            className="text-white/60 dark hover:text-white hover:bg-white/10 rounded-lg"  
                            variant="light" 
                            onPress={onClose}
                            >
                            Close
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
      </Modal>
    )
}