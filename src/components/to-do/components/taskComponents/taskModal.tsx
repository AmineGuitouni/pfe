"use client"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
} from "@heroui/react";
import { Task } from "@/components/dashboard/projects/types";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import framer-motion
import Information from "./taskModalComponents/informations";
import CommentContainer from "./taskModalComponents/commentContainer";

export default function TaskModal({ 
  isOpen, 
  onOpenChange, 
  setTask,
  task,
  project_id,
  originalTask,
  dependncies
}: { 
  isOpen: boolean, 
  onOpenChange: (isOpen: boolean) => void,
  task: Task,
  setTask : React.Dispatch<React.SetStateAction<Task>>
  project_id : string
  originalTask : Task
  dependncies : Task[]
}) {

  const [goToComment,setGoToComment] = useState(false)

  return (
    <>
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
              <ModalHeader className="flex  gap-2 items-baseline text-xl font-bold">
                {task.title}
                {task.id !== originalTask.id && (
                  <button
                    onClick={() => setTask(originalTask)}
                    className="text-sm text-light_blue-500/50 hover:underline"
                  >
                    Back to original task
                  </button>
                )}
              </ModalHeader>
              
              <AnimatePresence mode="wait">
                {goToComment ? (
                  <motion.div
                    key="comments"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CommentContainer task_id={task.id} project_id={project_id} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="information"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Information task={task} setTask={setTask} dependncies={dependncies} />
                  </motion.div>
                )}
              </AnimatePresence>
              
              <ModalFooter>
                <Button 
                  className="text-white/60 dark hover:text-white hover:bg-white/10 rounded-lg"  
                  variant="light" 
                  onPress={onClose}
                >
                  Close
                </Button>
                <Button 
                  className="bg-light_blue-500 text-dark_blue hover:bg-light_blue rounded-lg" 
                  onPress={()=>setGoToComment(!goToComment)}
                >
                  {!goToComment ? "See comments" : "See task informations"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
