"use client"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@heroui/react";
import { useState } from "react";
import { useCompanies } from "../companies/useCompanies";
import { useSession } from "next-auth/react";

export default function AddCompanyButton() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const {setCompanies} = useCompanies();
    const {data:session} = useSession();
    const [loading, setLoading] = useState(false);

    const validateInput = (value: string) => {
        if (value.trim().length === 0) {
            setError('Company name cannot be empty');
            return false;
        }
        if (value.length < 2) {
            setError('Company name must be at least 2 characters long');
            return false;
        }
        if (value.length > 50) {
            setError('Company name cannot exceed 50 characters');
            return false;
        }
        setError('');
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        validateInput(value);
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!session) {
            return;
        }
        
        if (!validateInput(name)) {
            return;
        }

        setLoading(true);

        const originUrl = window.location.origin;

        try {
            const response = await fetch(`${originUrl}/api/dashboard/companies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({name, user_id:session?.user.id}),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }

            setCompanies((prevCompanies) => 
                prevCompanies ?
                [...prevCompanies, {id:session?.user.id, name}] : [{id:session?.user.id, name}]
            );

            setName('');
            setError('');
            onOpenChange();
        } catch (err) {
            setError('Failed to add company. Please try again.'+err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button 
                onPress={onOpen}
                size="sm" 
                className="bg-light_blue-500 text-dark_blue font-[600]"
            >
                New Company
            </Button>
            <Modal 
                isOpen={isOpen} 
                radius="sm" 
                classNames={{
                    base: "bg-modal_bg border rounded-lg border-white/20",
                    header: "text-light_blue-500 border-b border-white/20",
                    body: "pt-6",
                    // footer: "border-t border-white/10",
                    closeButton: "text-white/60 hover:text-white/80"
                  }} 
                onOpenChange={onOpenChange}
            >
                <ModalContent>
                {(onClose) => (
                    <form onSubmit={onSubmit}>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            Add company
                        </ModalHeader>
                        <ModalBody>
                            <Input
                                isRequired
                                variant="bordered"
                                className="w-full text-white dark"
                                placeholder="Enter the company name"
                                label="Company name"
                                value={name}
                                onChange={handleInputChange}
                                type="text"
                                isInvalid={!!error}
                                errorMessage={error}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => {
                                    setError('');
                                    setName('');
                                    onClose();
                                }}
                                className="text-white/60 dark hover:text-white hover:bg-white/10"
                            >
                                Cancel
                            </Button>
                            <Button 
                                isLoading={loading}
                                isDisabled={loading}
                                type="submit" 
                                className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                            >
                                Add
                            </Button>
                        </ModalFooter>
                    </form>
                )}
                </ModalContent>
            </Modal>
        </>
    );
}