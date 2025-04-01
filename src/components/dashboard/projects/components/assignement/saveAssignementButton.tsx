"use client"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { Save } from "lucide-react";
import { useState } from "react";
import { useTaskUserAssgnementContext } from "../../context/taskUserAssgnementContext";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SaveAssignementButton({company_id, project_id}: {company_id: string, project_id: string}) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const [loading, setLoading] = useState(false)
    const [deadline, setDeadline] = useState("")
    const {taskUserLinks, unLinkedTasks} = useTaskUserAssgnementContext()
    const {data:session} = useSession();
    const router = useRouter();

    const onSubmit = async (e: React.FormEvent, onClose: () => void) => {
        e.preventDefault()
        if(!session?.user.id) return
        setLoading(true)

        try {
            if(unLinkedTasks.length > 0){
                toast.error("All tasks must be assigned to a user")
                throw new Error("All tasks must be assigned to a user")
            }

            const response = await fetch(`/api/v1/${session?.user.id}/companies/${company_id}/projects/${project_id}/tasks/assign`, {
                method: "POST",
                body: JSON.stringify({taskUserLinks, deadline})
            })

            if(!response.ok){
                toast.error("Error assigning users to tasks")
                throw new Error("Error assigning users to tasks")
            }

            router.push(`/dashboard/${company_id}/projects`)
            router.refresh()
            onClose()
        }
        catch(err){
            console.log(err)
        }
        finally{
            setLoading(false)
        }
    }

    return (
        <>
        <Button
            size="sm"
            className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0"
            startContent={<Save className="w-4 h-4" />}
            onPress={onOpen}
        >
            Save
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
                    <>
                    <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                        Save Assignments
                    </ModalHeader>
                    <form onSubmit={(e)=>onSubmit(e, onClose)}>
                    <ModalBody className="flex flex-col gap-4 text-white">
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
                        isDisabled={loading}
                        isLoading={loading}
                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                    >
                        Submit
                    </Button>
                    </ModalFooter>
                    </form>
                    </>
                )}
            </ModalContent>
            </Modal>
        </>
    );
}