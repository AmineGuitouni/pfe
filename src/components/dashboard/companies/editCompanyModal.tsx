"use client"
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SharedSelection, Textarea, cn } from "@heroui/react"; // Added Textarea, cn
import { useState, useEffect } from "react";
import { useCompanies } from "./contexts/useCompanies";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";
import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";
import { toast } from "react-toastify"; // Added toast
import Image from "next/image"; // Added Image
import { IoCloudUploadSharp } from "react-icons/io5"; // Added Icon

interface EditCompanyModalProps {
    company: CompanyType;
    isOpen: boolean;
    onOpenChange?: () => void;
}

export default function EditCompanyModal({ company, isOpen, onOpenChange }: EditCompanyModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState(''); // Added state
    const [industry, setIndustry] = useState(''); // Added state
    const [logoFile, setLogoFile] = useState<File | null>(null); // Added state
    const [logoPreview, setLogoPreview] = useState<string | null>(null); // Added state
    const [uploadingLogo, setUploadingLogo] = useState(false); // Added state
    const [error, setError] = useState({filed : '', message : ''});
    const { setCompanies } = useCompanies();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<SharedSelection>(new Set([]));

    useEffect(() => {
        if (isOpen && company) {
            setName(company.name);
            setDescription(company.description || ''); 
            setIndustry(company.industry || '');
            setLogoPreview(company.logo || null); 
            setLogoFile(null); 
            if (company.database) {
                setSelectedDatabase(new Set([company.database.id]));
            } else {
                setSelectedDatabase(new Set([]));
            }
        }
    }, [isOpen, company]);

    const validateInput = (value: string) => {
        if (value.trim().length === 0) {
            setError({filed : 'name', message : 'Company name is required'});
            return false;
        }
        if (value.length < 2) {
            setError({filed: 'name', message: 'Company name must be at least 2 characters long'});
            return false;
        }
        if (value.length > 50) {
            setError({filed : 'name', message : 'Company name cannot exceed 50 characters'});
            return false;
        }
        if (industry && industry.length > 50) {
            setError({filed : 'industry', message : 'Industry cannot exceed 50 characters'});
            return false;
        }
        if (industry && industry.length < 2) {
            setError({filed: 'industry', message: 'Industry must be at least 2 characters long'});
            return false;
        }
        setError({filed : "", message : ""});
        if(Array.from(selectedDatabase).length > 1) {
            setError({filed: 'database', message: 'Please select only one database'});
            return false;
        }
        if (description && description.length < 10) {
            setError({filed : 'description', message : 'Description must be at least 10 characters long'});
            return false;
        }
        return true;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setError({filed : "", message : ""}); 
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setError({filed : "", message : ""});
    };

    const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIndustry(e.target.value);
        setError({filed : "", message : ""});
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error("Logo size should be less than 5MB");
                return;
            }
            setUploadingLogo(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                setLogoFile(file);
                setUploadingLogo(false);
            };
            reader.readAsDataURL(file);
        }
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

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('industry', industry.trim());
        if (databaseId) {
            formData.append('database_id', databaseId as string);
        } else {
             formData.append('database_id', ''); // Send empty string if null to clear it
        }
        if (logoFile) {
            formData.append('logo', logoFile); // Append new logo file if selected
        }
        // Note: We don't send company_id in FormData, it's in the URL

        try {
            const response = await fetch(`${originUrl}/api/v1/${session.user.id}/companies/${company.id}/edit`, {
                method: "PUT",
                body: formData, // Send FormData
            });

            const data = await response.json();

            if (data.error) {
                setError({filed: "", message: data.error});
                return; // Exit early on error
            }

            const databaseData = database ? {
                id: database.id,
                name: database.name,
                created_at: database.created_at
            } : null;

            // Get the potentially updated logo URL from the response
            // Use the logoFile preview if a new file was selected but backend didn't return URL (optional)
            const updatedLogoUrl = data.data?.logo_url !== undefined ? data.data.logo_url : (logoFile ? logoPreview : company.logo);


            setCompanies((prevCompanies) =>
                prevCompanies ? prevCompanies.map(c =>
                    c.id === company.id ?
                    {...c, 
                        name: name.trim(), 
                        description: description.trim(),
                        industry: industry.trim(),
                        logo: updatedLogoUrl, 
                        database: databaseData 
                    } :
                    c 
                ) : []
            );

            toast.success("Company updated successfully!"); 
            setError({filed : "", message : ""});
            onOpenChange?.(); 
        } catch {
            setError({filed : "", message : "An error occurred while updating the company"});
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
                            isInvalid={error.filed === 'name'}
                            errorMessage={error.message}
                        />
                        <Input
                            variant="bordered"
                            className="w-full text-white dark"
                            placeholder="Enter the company industry"
                            label="Company Industry"
                            value={industry}
                            onChange={handleIndustryChange}
                            type="text"
                            isInvalid={error.filed === 'industry'}
                            errorMessage={error.message}
                        />
                        <Select
                            label="Select Database (optional)"
                            className=" dark"
                            selectedKeys={selectedDatabase}
                            onSelectionChange={setSelectedDatabase}
                            variant="bordered"
                            isInvalid={error.filed === 'database'}
                            errorMessage={error.message}
                        >
                            {databases.map((db) => (
                                <SelectItem key={db.id}>
                                    {db.name}
                                </SelectItem>
                            ))}
                        </Select>
                        {/* Ensure fields are inside ModalBody */}
                        <Textarea
                            variant="bordered"
                            className="w-full text-white dark"
                            placeholder="Enter the company description"
                            label="Company Description"
                            value={description}
                            onChange={(e:any)=>handleDescriptionChange(e)} // Keep original handler
                            isInvalid={error.filed === 'description'}
                            errorMessage={error.message}
                        />
                        
                        <Input
                            id="edit-logo-upload" // Unique ID
                            variant="bordered"
                            className="hidden"
                            type="file"
                            onChange={handleLogoChange}
                            accept="image/*"
                            disabled={uploadingLogo}
                        />
                        <div className="flex flex-col items-start">
                            <span className="text-sm text-white/60 mb-2 ml-2">Company Logo</span>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="edit-logo-upload" className="relative group cursor-pointer">
                                    <div className={cn("w-20 h-20 rounded-md overflow-hidden flex items-center justify-center text-xl font-medium", "bg-white/10 border border-white/20 text-white/60", "transition-all duration-300 group-hover:brightness-75")}>
                                        {logoPreview ? (<Image src={logoPreview} width={100} height={100} alt="Logo Preview" className="w-full h-full object-contain" />) : (<span className="text-xs">Upload Logo</span>)}
                                    </div>
                                    <div className={cn("absolute inset-0 flex items-center justify-center", "opacity-0 group-hover:opacity-100 transition-opacity duration-300", "bg-black/40 rounded-md")}>
                                        {uploadingLogo ? (<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : (<IoCloudUploadSharp size={20} className="text-white"/>)}
                                    </div>
                                </label>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button
                            variant="light"
                            onPress={() => {
                                setError({filed : "", message : ""});
                                setName(company.name);
                                setDescription(company.description || '');
                                setIndustry(company.industry || '');
                                setLogoPreview(company.logo || null);
                                setLogoFile(null);
                                if (company.database) {
                                    setSelectedDatabase(new Set([company.database.id]));
                                } else {
                                    setSelectedDatabase(new Set([]));
                                }
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