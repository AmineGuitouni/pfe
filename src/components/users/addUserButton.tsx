"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Input,
    useDisclosure,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { IoPersonAddSharp } from "react-icons/io5";
import { toast } from "react-toastify";
import SelectGroups from "./groupSelector";

export default function AddModal({company_id}:{company_id:string}) {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    const {data:session} = useSession();
    const [group,setGroup] = useState('');


    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (closeModal: () => void) => {
        // Reset previous errors
        setError('');

        // Validate email
        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Invalid email format');
            return;
        }

        if (!company_id || !session?.user?.id) {
            setError('some informations are missing');
            return;
        }

        // Set loading state
        setLoading(true);

        try {
            const params = new URLSearchParams({
                email: email,
                group: group
              })
            // Send invitation
            const response = await fetch(`/api/v1/${session.user.id}/companies/${company_id}/users/new?${params.toString()}`, {
                method: 'GET',
            });

            const result = await response.json();

            // Handle different response scenarios
            if (!response.ok) {
                // Map specific error messages
                const errorMessages: { [key: string]: string } = {
                    'User already exists': 'This user is already in the team',
                    'Invalid email format': 'Please enter a valid email address',
                    'Email is required': 'Email cannot be empty',
                    'Failed to connect to database': 'Unable to process the invitation',
                    'Unable to send email, try again later': 'Email invitation could not be sent',
                };

                const errorMessage = errorMessages[result.error] || result.error || 'An unexpected error occurred';
                
                setError(errorMessage);
                
                // Show toast notification for error
                toast.error(errorMessage);

                return;
            }

            // Success scenario
            toast.success('Invitation sent successfully!');

            // Clear email and close modal
            setEmail('');
            closeModal();

        } catch (err) {
            console.error('Invitation send error:', err);
            setError('Network error. Please try again.');
            
            toast.error('Network error. Please try again.');
        } finally {
            // Always reset loading state
            setLoading(false);
        }
    };

    return (
        <>
        <Button 
            onPress={onOpen} 
            startContent={<IoPersonAddSharp size={18} />} 
            className="bg-light_blue text-dark_blue" 
            isIconOnly
        />

        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "pt-6",
                closeButton: "text-white/60 hover:text-white/10"
            }} 
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            Add new user to the team
                        </ModalHeader>
                        <ModalBody className="mb-3">
                            <form 
                                className="flex flex-col gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSubmit(onClose);
                                }}
                            > 
                                <div className="flex justify-between items-center w-full gap-3 mb-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">Email</span>
                                    <Input
                                        radius="sm"
                                        variant="bordered"
                                        type="email"
                                        onValueChange={(value) => {
                                            setEmail(value);
                                            if(error) setError('')
                                        }}
                                        errorMessage={error}
                                        isInvalid={error !== ""}
                                        classNames={{
                                            base:"w-[60%]",
                                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                            input:"text-white/70",
                                        }}
                                        value={email}
                                        placeholder={"Enter the new user email"}
                                        required
                                    />
                                </div>

                                <div className="flex justify-between items-center w-full gap-3 mb-3">
                                    <span className="text-white/60 text-sm flex-shrink-0">Group</span>
                                    <SelectGroups company_id={company_id} onSelectionChange={(value) => setGroup(value as string)} />
                                </div>


                                <div className="flex justify-end gap-2 w-full">
                                    <Button
                                        variant="light"
                                        onPress={onClose}
                                        className="text-white/60 dark hover:text-white hover:bg-white/10"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        isLoading={loading}
                                        isDisabled={loading}
                                        className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </form> 
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
        </>
    );
}