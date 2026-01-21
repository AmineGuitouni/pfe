"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Select, SelectItem, Chip } from "@heroui/react"
import { useState } from "react"
import { GeneratedTask } from "../../types";

interface EditTaskModalProps {
    task: GeneratedTask,
    tasks: GeneratedTask[],
    isOpen: boolean,
    onOpenChange?: (isOpen: boolean) => void,
    onEditTask?: (task: GeneratedTask) => void
}

export default function EditTaskModal({ task, tasks, isOpen, onOpenChange, onEditTask }: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title)
  const [dependencies, setDependencies] = useState<string[]>(task.dependencies)
  const [difficultyLevel, setDifficultyLevel] = useState(task.difficultyLevel)
  const [description, setDescription] = useState(task.description)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (onClose: () => void) => {
    setIsLoading(true)
    try {
      onEditTask?.({
        ...task,
        title,
        description, 
        dependencies,
        difficultyLevel
      })
      onClose()
    } catch (error) {
      console.error("Error editing task:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
            e.preventDefault()
            handleSubmit(onClose)
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
                      className="w-full text-white dark"
                      label="Difficulty Level"
                      value={difficultyLevel.toString()}
                      onChange={(e) => {
                          const lvl = Math.floor(Number(e.target.value))
                          if(lvl > 5) setDifficultyLevel(5);
                          else if (lvl < 1) setDifficultyLevel(1);
                          setDifficultyLevel(lvl)
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
              />

              <Select
                radius="sm"
                items={tasks}
                label="Dependencies"
                selectionMode="multiple"
                variant="bordered"
                labelPlacement="outside"
                className="dark"
                classNames={{
                  base: "w-full h-fit dark text-white",
                  trigger: "min-h-12 h-fit py-2 bg-transparent border-default-200",
                  popoverContent: "bg-modal_bg  border-white/20",
                  
                }}
                selectedKeys={dependencies}
                onSelectionChange={(keys) => setDependencies(Array.from(keys) as string[])}
              >
                {(task) => (
                  <SelectItem key={task.title} textValue={task.title}>
                    <div className="flex gap-2 items-center">
                      <div className="flex flex-col">
                        <span className="text-small text-white">{task.title}</span>
                        <span className="text-tiny text-default-400">{task.description}</span>
                      </div>
                    </div>
                  </SelectItem>
                )}
              </Select>

              <div className="flex flex-wrap gap-1">
                {
                  dependencies.map(d=>(
                    <Chip
                        key={d}
                        size="sm"
                        variant="flat"
                        className="ml-1 mb-1"
                        classNames={{
                          base: "bg-dark_blue text-light_blue border-light_blue",
                          content: "text-light_blue",
                        }}
                      >
                        {d}
                      </Chip>
                  ))
                }
              </div>
              
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
                className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
              >
                Save Changes
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  )
}