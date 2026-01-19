"use client"

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Chip } from "@heroui/react"
import { useState } from "react"
import { FiAlertTriangle, FiTrash2, FiLink, FiX } from "react-icons/fi"
import { DeleteMode } from "../../hooks/useEditProject"

interface DependentTask {
    id: string;
    title: string;
}

interface EditTaskDeleteConfirmationProps {
    taskTitle: string;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    hasDependents: boolean;
    dependentTasks: DependentTask[];
    onConfirmDelete: (mode: DeleteMode) => Promise<void>;
    isLoading?: boolean;
}

export default function EditTaskDeleteConfirmation({
    taskTitle,
    isOpen,
    onOpenChange,
    hasDependents,
    dependentTasks,
    onConfirmDelete,
    isLoading = false,
}: EditTaskDeleteConfirmationProps) {
    const [selectedMode, setSelectedMode] = useState<DeleteMode | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!selectedMode && hasDependents) return;
        
        setIsDeleting(true);
        try {
            await onConfirmDelete(selectedMode || "remove_dependency");
            onOpenChange(false);
            setSelectedMode(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleClose = () => {
        setSelectedMode(null);
        onOpenChange(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={handleClose}
            radius="sm"
            size="lg"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "border-b border-white/20",
                body: "py-6",
                closeButton: "text-white/60 hover:text-white/80"
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex items-center gap-2 text-red-400">
                            <FiAlertTriangle className="text-red-500" size={20} />
                            Delete Task
                        </ModalHeader>

                        <ModalBody className="flex flex-col gap-4">
                            <p className="text-white/80">
                                Are you sure you want to delete the task{" "}
                                <span className="font-semibold text-light_blue">&quot;{taskTitle}&quot;</span>?
                            </p>

                            {hasDependents && (
                                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FiLink className="text-yellow-500" size={18} />
                                        <span className="text-yellow-500 font-medium">
                                            This task has dependent tasks
                                        </span>
                                    </div>
                                    <p className="text-white/70 text-sm mb-3">
                                        The following tasks depend on this task:
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {dependentTasks.map((task) => (
                                            <Chip
                                                key={task.id}
                                                size="sm"
                                                variant="flat"
                                                classNames={{
                                                    base: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
                                                    content: "text-yellow-400",
                                                }}
                                            >
                                                {task.title}
                                            </Chip>
                                        ))}
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-white/70 text-sm font-medium mb-2">
                                            Choose how to handle these dependencies:
                                        </p>

                                        <button
                                            onClick={() => setSelectedMode("remove_dependency")}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                selectedMode === "remove_dependency"
                                                    ? "border-light_blue bg-light_blue/10"
                                                    : "border-white/20 hover:border-white/40 bg-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <FiLink className="text-light_blue" size={16} />
                                                <span className="font-medium text-white">Remove Dependencies</span>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                Delete this task and remove it from the dependencies of other tasks.
                                                The dependent tasks will remain but no longer reference this task.
                                            </p>
                                        </button>

                                        <button
                                            onClick={() => setSelectedMode("cascade")}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                selectedMode === "cascade"
                                                    ? "border-red-500 bg-red-500/10"
                                                    : "border-white/20 hover:border-white/40 bg-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <FiTrash2 className="text-red-500" size={16} />
                                                <span className="font-medium text-white">Cascade Delete</span>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                Delete this task AND all tasks that depend on it.
                                                <span className="text-red-400 font-medium">
                                                    {" "}This will delete {dependentTasks.length + 1} task(s) in total.
                                                </span>
                                            </p>
                                        </button>

                                        <button
                                            onClick={() => setSelectedMode("cancel")}
                                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                                                selectedMode === "cancel"
                                                    ? "border-gray-500 bg-gray-500/10"
                                                    : "border-white/20 hover:border-white/40 bg-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <FiX className="text-gray-400" size={16} />
                                                <span className="font-medium text-white">Cancel</span>
                                            </div>
                                            <p className="text-white/60 text-sm">
                                                Don&apos;t delete this task. First remove the dependencies manually.
                                            </p>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!hasDependents && (
                                <p className="text-white/60 text-sm">
                                    This action cannot be undone. The task and all its associated data will be permanently removed.
                                </p>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={handleClose}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                                radius="sm"
                            >
                                Cancel
                            </Button>
                            {(!hasDependents || (selectedMode && selectedMode !== "cancel")) && (
                                <Button
                                    color="danger"
                                    onPress={handleConfirm}
                                    isLoading={isDeleting || isLoading}
                                    isDisabled={hasDependents && !selectedMode}
                                    radius="sm"
                                    className="bg-red-500 hover:bg-red-600"
                                >
                                    {selectedMode === "cascade" 
                                        ? `Delete ${dependentTasks.length + 1} Tasks` 
                                        : "Delete Task"
                                    }
                                </Button>
                            )}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
