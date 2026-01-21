"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Select, SelectItem, Chip } from "@heroui/react"
import { useState } from "react"
import { Task } from "../../types"

interface AddTaskToProjectModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    tasks: Record<string, Task>;
    onAddTask: (task: {
        title: string;
        description: string;
        difficultyLevel: number;
        dependencies?: string[];
    }) => Promise<Task | null>;
}

export default function AddTaskToProjectModal({
    isOpen,
    onOpenChange,
    tasks,
    onAddTask,
}: AddTaskToProjectModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficultyLevel, setDifficultyLevel] = useState(1);
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const tasksList = Object.values(tasks);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setDifficultyLevel(1);
        setDependencies([]);
    };

    const handleSubmit = async (onClose: () => void) => {
        if (!title.trim() || !description.trim()) return;

        setIsLoading(true);
        try {
            const result = await onAddTask({
                title: title.trim(),
                description: description.trim(),
                difficultyLevel,
                dependencies: dependencies.length > 0 ? dependencies : undefined,
            });

            if (result) {
                resetForm();
                onClose();
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        resetForm();
        onOpenChange(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            radius="sm"
            size="xl"
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "pt-6",
                closeButton: "text-white/60 hover:text-white/80"
            }}
            onOpenChange={handleClose}
        >
            <ModalContent>
                {(onClose) => (
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(onClose);
                    }}>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            Add New Task
                        </ModalHeader>

                        <ModalBody className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <Input
                                    variant="bordered"
                                    size="sm"
                                    className="w-full text-white dark"
                                    label="Task Title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    isRequired
                                    radius="sm"
                                />
                                <Input
                                    radius="sm"
                                    type="number"
                                    variant="bordered"
                                    size="sm"
                                    className="w-[200px] text-white dark"
                                    label="Difficulty (1-5)"
                                    min={1}
                                    max={5}
                                    value={difficultyLevel.toString()}
                                    onChange={(e) => {
                                        const lvl = Math.floor(Number(e.target.value));
                                        if (lvl > 5) setDifficultyLevel(5);
                                        else if (lvl < 1) setDifficultyLevel(1);
                                        else setDifficultyLevel(lvl);
                                    }}
                                    isRequired
                                />
                            </div>

                            <Textarea
                                radius="sm"
                                variant="bordered"
                                className="w-full text-white dark"
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                isRequired
                                minRows={3}
                            />

                            {tasksList.length > 0 && (
                                <>
                                    <Select
                                        radius="sm"
                                        items={tasksList}
                                        label="Dependencies (optional)"
                                        selectionMode="multiple"
                                        variant="bordered"
                                        labelPlacement="outside"
                                        className="dark"
                                        classNames={{
                                            base: "w-full h-fit dark text-white",
                                            trigger: "min-h-12 h-fit py-2 bg-transparent border-default-200",
                                            popoverContent: "bg-modal_bg border-white/20",
                                        }}
                                        selectedKeys={dependencies}
                                        onSelectionChange={(keys) => setDependencies(Array.from(keys) as string[])}
                                    >
                                        {(task) => (
                                            <SelectItem key={task.id} textValue={task.title}>
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-small text-white">{task.title}</span>
                                                        <span className="text-tiny text-default-400 line-clamp-1">
                                                            {task.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        )}
                                    </Select>

                                    {dependencies.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {dependencies.map(depId => {
                                                const task = tasks[depId];
                                                return task ? (
                                                    <Chip
                                                        key={depId}
                                                        size="sm"
                                                        variant="flat"
                                                        classNames={{
                                                            base: "bg-dark_blue text-light_blue border-light_blue",
                                                            content: "text-light_blue",
                                                        }}
                                                        onClose={() => setDependencies(prev => prev.filter(id => id !== depId))}
                                                    >
                                                        {task.title}
                                                    </Chip>
                                                ) : null;
                                            })}
                                        </div>
                                    )}
                                </>
                            )}
                        </ModalBody>

                        <ModalFooter>
                            <Button
                                radius="sm"
                                variant="light"
                                onPress={handleClose}
                                className="text-white/60 dark hover:text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button
                                radius="sm"
                                type="submit"
                                isLoading={isLoading}
                                isDisabled={!title.trim() || !description.trim()}
                                className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                            >
                                Add Task
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
}
