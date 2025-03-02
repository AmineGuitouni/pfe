"use client"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SharedSelection, useDisclosure } from "@heroui/react";
import { useState, useEffect } from "react";
import { useCompanies } from "./contexts/useCompanies";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";
import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";

export default function AddCompanyButton() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const {setCompanies} = useCompanies();
    const {data:session} = useSession();
    const [loading, setLoading] = useState(false);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<SharedSelection>(new Set([]));

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
        if(Array.from(selectedDatabase).length > 1) {
            setError('Please select only one database');
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

    useEffect(() => {
        if (!isOpen || !session) return;
        
        const fetchDatabases = async () => {
            try {
                const response = await fetch(`/api/v1/${session.user.id}/databases/list`);
                const { data } = await response.json();
                setDatabases(data || []);
            } catch (error) {
                console.error('Failed to fetch databases:', error);
            }
        };

        fetchDatabases();
    }, [isOpen, session]);

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
        const database = Array.from(selectedDatabase).length === 0 ? 
        databases.find((database) => database.id === Array.from(selectedDatabase)[0]) :
        undefined

        try {
            const response = await fetch(`${originUrl}/api/v1/${session.user.id}/companies/new`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    database_id: database ? database.id : null,
                }),
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                return;
            }
            
            const databaseData = database ? {
                id: database.id,
                name: database.name,
                created_at: database.created_at
            } : null

            const newCompany: CompanyType = {
                id:session.user.id, 
                name,
                created_at: new Date().toUTCString(),
                database: databaseData
            }

            setCompanies((prevCompanies) => 
                prevCompanies ?
                [...prevCompanies, newCompany] : [newCompany]
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
                            <Select
                                label="Select Database (optional)"
                                className="mt-4 dark"
                                selectedKeys={selectedDatabase}
                                onSelectionChange={setSelectedDatabase}
                                variant="bordered"
                            >
                                {databases.map((db) => (
                                    <SelectItem key={db.id} value={db.id}>
                                        {db.name}
                                    </SelectItem>
                                ))}
                            </Select>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => {
                                    setError('');
                                    setName('');
                                    setSelectedDatabase(new Set([]));
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