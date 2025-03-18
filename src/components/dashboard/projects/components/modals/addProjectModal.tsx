"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@heroui/react"
import { PlusIcon } from "lucide-react";
import { useState } from "react"

interface AddProjectModalProps {
  onCreateProject?: (project: { name: string; description: string;}) => Promise<void>
}

export default function AddProjectModal({ onCreateProject }: AddProjectModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (onClose: () => void) => {
    setIsLoading(true)
    try {
      await onCreateProject?.({ name, description })
      onClose()
      setName("")
      setDescription("")
      setDeadline("")
    } catch (error) {
      console.error("Error creating project:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button onPress={onOpen} color="primary" className="bg-light_blue-500 text-black">
        <PlusIcon size={20} /> Add Project
      </Button>

      <Modal
        isOpen={isOpen}
        radius="sm"
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
                Add New Project
              </ModalHeader>

              <ModalBody className="flex flex-col gap-4">
                <Input
                  variant="bordered"
                  className="w-full text-white dark"
                  label="Project Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  isRequired
                />

                <Textarea
                  variant="bordered"
                  className="w-full text-white dark"
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  isRequired
                />

                <Input
                  variant="bordered"
                  className="w-full text-white dark"
                  type="date"
                  label="Deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  isRequired
                />
              </ModalBody>

              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-white/60 dark hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                >
                  Create Project
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}