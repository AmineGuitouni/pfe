"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Select, SelectItem, Chip } from "@heroui/react"
import { useState, useEffect } from "react"
import { Task } from "../../types"

interface EditExistingTaskModalProps {
    task: Task;
    tasks: Record<string, Task>;
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onEditTask: (taskId: string, data: Partial<Task>) => Promise<boolean>;
}

export default function EditExistingTaskModal({
    task,
    tasks,
    isOpen,
    onOpenChange,
    onEditTask,
}: EditExistingTaskModalProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description);
    const [difficultyLevel, setDifficultyLevel] = useState(task.difficultyLevel);
    // Dependencies are stored as titles, need to convert to IDs for selection
    const [dependencies, setDependencies] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Get available tasks (exclude current task)
    const availableTasks = Object.values(tasks).filter(t => t.id !== task.id);

    // Convert dependency titles to IDs on mount
    useEffect(() => {
        if (task.dependencies && task.dependencies.length > 0) {
            const depIds = task.dependencies
                .map(depTitle => {
                    const foundTask = Object.values(tasks).find(t => t.title === depTitle);
                    return foundTask?.id;
                })
                .filter(Boolean) as string[];
            setDependencies(depIds);
        } else {
            setDependencies([]);
        }
    }, [task, tasks]);

    // Reset form when task changes
    useEffect(() => {
        setTitle(task.title);
        setDescription(task.description);
        setDifficultyLevel(task.difficultyLevel);
    }, [task]);

    const handleSubmit = async (onClose: () => void) => {
        if (!title.trim() || !description.trim()) return;

        setIsLoading(true);
        try {
            const updateData: Partial<Task> = {};
            
            if (title.trim() !== task.title) updateData.title = title.trim();
            if (description.trim() !== task.description) updateData.description = description.trim();
            if (difficultyLevel !== task.difficultyLevel) updateData.difficultyLevel = difficultyLevel;
            
            // Always send dependencies to ensure proper update
            updateData.dependencies = dependencies;

            const success = await onEditTask(task.id, updateData);
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
            size="xl"
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
                            Edit Task
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

                            {availableTasks.length > 0 && (
                                <>
                                    <Select
                                        radius="sm"
                                        items={availableTasks}
                                        label="Dependencies"
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
                                        {(t) => (
                                            <SelectItem key={t.id} textValue={t.title}>
                                                <div className="flex gap-2 items-center">
                                                    <div className="flex flex-col">
                                                        <span className="text-small text-white">{t.title}</span>
                                                        <span className="text-tiny text-default-400 line-clamp-1">
                                                            {t.description}
                                                        </span>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        )}
                                    </Select>

                                    {dependencies.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {dependencies.map(depId => {
                                                const depTask = tasks[depId];
                                                return depTask ? (
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
                                                        {depTask.title}
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
                                onPress={onClose}
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
                                Save Changes
                            </Button>
                        </ModalFooter>
                    </form>
                )}
            </ModalContent>
        </Modal>
    );
}
