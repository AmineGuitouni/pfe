"use client"
import { Button, cn, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, SharedSelection, Textarea, useDisclosure } from "@heroui/react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify"; // Add toast import
import { useCompanies } from "./contexts/useCompanies";
import { IoCloudUploadSharp } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";
import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";
import Image from "next/image";

export default function AddCompanyButton() {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [logoFile, setLogoFile] = useState<File | null>(null); // Renamed state for clarity
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [error, setError] = useState({filed : "", message : ""});
    const {setCompanies} = useCompanies();
    const {data:session} = useSession();
    const [loading, setLoading] = useState(false);
    const [databases, setDatabases] = useState<Database[]>([]);
    const [selectedDatabase, setSelectedDatabase] = useState<SharedSelection>(new Set([]));
    const [industry, setIndustry] = useState('');

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
        if(Array.from(selectedDatabase).length > 1) {
            setError({filed: 'database', message: 'Please select only one database'});
            return false;
        }
        if (description && description.length < 10) {
            setError({filed : 'description', message : 'Description must be at least 10 characters long'});
            return false;
        }
        setError({filed : "", message : ""});
        return true;
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setName(value);
        setError({filed : "", message : ""});
    };

    const handleIndustryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIndustry(e.target.value);
        setError({filed : "", message : ""});
    }

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        setError({filed : "", message : ""}); 
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit like profile pic
                toast.error("Logo size should be less than 5MB"); // Consider adding toast notifications
                return;
            }
            setUploadingLogo(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
                setLogoFile(file);
                setUploadingLogo(false);
            };
            reader.onerror = () => {
                setUploadingLogo(false); // Handle error case
            }
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
        if (!session) {
            return;
        }
        
        if (!validateInput(name)) {
            return;
        }

        setLoading(true);

        const originUrl = window.location.origin;
        const database = Array.from(selectedDatabase).length === 1 ? 
        databases.find((database) => database.id === Array.from(selectedDatabase)[0]) :
        undefined

        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('description', description.trim());
        formData.append('industry', industry.trim()); 
        if (database) {
            formData.append('database_id', database.id);
        }
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        try {
            const response = await fetch(`${originUrl}/api/v1/${session.user.id}/companies/new`, {
                method: "POST",
                body: formData,
            });

            const {data} = await response.json();

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
                id:data.id,
                name,
                description, // Include description in the new company object
                created_at: new Date().toUTCString(),
                database: databaseData,
                workers: 0 // Initialize workers count to 0
            }

            console.log(newCompany)

            setCompanies((prevCompanies) => 
                prevCompanies ?
                [...prevCompanies, newCompany] : [newCompany]
            );

            setName('');
            setDescription('');
            setLogoFile(null);
            setLogoPreview(null);
            setError({filed : "", message : ""});
            onOpenChange();
        } catch {
            setError({filed: "", message: 'Failed to add company. Please try again.'});
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
                                isInvalid={error.filed === 'name'}
                                errorMessage={error.message}
                            />
                            <Input
                                isRequired
                                variant="bordered"
                                className="w-full text-white dark"
                                placeholder="Enter the company industry"
                                label="Company industry"
                                description="e.g. Technology, Finance, etc."
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
                            <Textarea
                                variant="bordered"
                                className=" w-full text-white dark"
                                placeholder="Enter the company description"
                                label="Company Description (optional)"
                                value={description}
                                onChange={(e : any)=> handleDescriptionChange(e)}
                                isInvalid={error.filed === 'description'}
                                errorMessage={error.message}
                            />
                            <Input
                                id="logo-upload" // ID for the label to reference
                                variant="bordered"
                                className="hidden" // Hide the actual file input
                                type="file"
                                onChange={handleLogoChange}
                                accept="image/*" // Accept only image files
                                disabled={uploadingLogo}
                            />
                            {/* Logo Input styled like profileInformation.tsx */}
                            <div className="mt-4 flex flex-col items-start">
                                <span className="text-sm text-white/60 mb-2">Company Logo (optional)</span>
                                <div className="flex items-center justify-center w-full ">
                                    <label htmlFor="logo-upload" className="relative group cursor-pointer ">
                                        <div className={cn(
                                            "w-20 h-20 rounded-md overflow-hidden flex items-center justify-center text-xl font-medium", // Use rounded-md for square look
                                            "bg-white/10 border border-white/20 text-white/60", // Adjusted background/border
                                            "transition-all duration-300 group-hover:brightness-75"
                                        )}>
                                            {logoPreview ? (
                                                <Image src={logoPreview} width={100} height={100} alt="Logo Preview" className="w-full h-full object-contain" /> // Use object-contain
                                            ) : (
                                                <span className="text-xs">Upload Logo</span> // Placeholder text
                                            )}
                                        </div>
                                        <div className={cn(
                                                "absolute inset-0 flex items-center justify-center",
                                                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                                "bg-black/40 rounded-md" // Match rounded-md
                                            )}
                                        >
                                            {uploadingLogo ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <IoCloudUploadSharp size={20} className="text-white"/>
                                            )}
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
                                    setName('');
                                    setDescription('');
                                    setLogoFile(null);
                                    setLogoPreview(null);
                                    setSelectedDatabase(new Set([]));
                                    setIndustry('');
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