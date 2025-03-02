"use client"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SharedSelection } from "@heroui/react";
import { useState, useEffect } from "react";
import { useCompanies } from "./contexts/useCompanies";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";
import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";

interface EditCompanyModalProps {
    company: CompanyType;
    isOpen: boolean;
    onOpenChange?: () => void;
}

export default function EditCompanyModal({ company, isOpen, onOpenChange }: EditCompanyModalProps) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { setCompanies } = useCompanies();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<SharedSelection>(new Set([]));

    // Initialize form with company data when modal opens
    useEffect(() => {
        if (isOpen && company) {
            setName(company.name);
            // Set selected database if company has one
            if (company.database) {
                setSelectedDatabase(new Set([company.database.id]));
            } else {
                setSelectedDatabase(new Set([]));
            }
        }
    }, [isOpen, company]);

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
        if (!session || !company) {
            return;
        }
        
        if (!validateInput(name)) {
            return;
        }

        setLoading(true);

        const originUrl = window.location.origin;
        const databaseId = Array.from(selectedDatabase).length > 0 ? 
            Array.from(selectedDatabase)[0] : null;

        const database = databaseId ?
            databases.find((db) => db.id === databaseId) :
            null;

        try {
            const response = await fetch(`${originUrl}/api/v1/${session.user.id}/companies/${company.id}/edit`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    company_id: company.id,
                    name,
                    database_id: databaseId,
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
            } : null;

            setCompanies((prevCompanies) => 
                prevCompanies ? prevCompanies.map(c => 
                    c.id === company.id ? 
                    {...c, name, database: databaseData} : 
                    c
                ) : []
            );

            setError('');
            onOpenChange?.();
        } catch (err) {
            setError('Failed to update company. Please try again.' + err);
        }
        finally {
            setLoading(false);
        }
    };

    return (
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
                <form onSubmit={onSubmit}>
                    <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                        Edit company
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
                            Save Changes
                        </Button>
                    </ModalFooter>
                </form>
            )}
            </ModalContent>
        </Modal>
    );
}