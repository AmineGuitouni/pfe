"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from "@heroui/react"
import { useState, useEffect } from "react"

interface ProjectData {
    id: string;
    name: string;
    description: string;
    deadline: string | null;
}

interface EditProjectDetailsModalProps {
    project: ProjectData;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSave: (data: Partial<ProjectData>) => Promise<boolean>;
}

export default function EditProjectDetailsModal({
    project,
    isOpen,
    onOpenChange,
    onSave,
}: EditProjectDetailsModalProps) {
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description);
    const [deadline, setDeadline] = useState(project.deadline || "");
    const [isLoading, setIsLoading] = useState(false);

    // Reset form when project changes
    useEffect(() => {
        setName(project.name);
        setDescription(project.description);
        setDeadline(project.deadline || "");
    }, [project]);

    const handleSubmit = async (onClose: () => void) => {
        setIsLoading(true);
        try {
            const updateData: Partial<ProjectData> = {};
            if (name !== project.name) updateData.name = name;
            if (description !== project.description) updateData.description = description;
            if ((deadline || null) !== project.deadline) updateData.deadline = deadline || null;

            if (Object.keys(updateData).length === 0) {
                onClose();
                return;
            }

            const success = await onSave(updateData);
            if (success) {
                onClose();
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            radius="sm"
            size="lg"
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
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(onClose);
                    }}>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            Edit Project Details
                        </ModalHeader>

                        <ModalBody className="flex flex-col gap-4">
                            <Input
                                variant="bordered"
                                className="w-full text-white dark"
                                label="Project Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                isRequired
                                radius="sm"
                            />

                            <Textarea
                                variant="bordered"
                                className="w-full text-white dark"
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                isRequired
                                radius="sm"
                                minRows={3}
                            />

                            <Input
                                type="date"
                                variant="bordered"
                                className="w-full text-white dark"
                                label="Deadline"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                radius="sm"
                                description="Leave empty for no deadline"
                            />
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="text-white/60 dark hover:text-white hover:bg-white/10"
                                radius="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isLoading}
                                className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                                radius="sm"
                            >
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
}
