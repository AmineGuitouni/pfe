"use client"
import { formatShortDate } from "@/lib/utils";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, cn, useDisclosure, Avatar } from "@heroui/react"; // Import Avatar
import { Key, useState } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { useCompanies } from "./contexts/useCompanies";
import EditCompanyModal from "./editCompanyModal";
import { CompanyType } from "@/app/api/v1/[user_id]/companies/list/route";
import { useRouter } from "next/navigation";

const dropdownItems = [
    {
        key: "view",
        label: "View",
    },
    {
        key: "edit",
        label: "Edit",
    },
    {
        key: "delete",
        label: "Delete",
    },
];

export default function CompanyCard({company}:{company:CompanyType}) {
    const [isDeleteing, setIsDeleteing] = useState(false);
    const {data:sessinon} = useSession();
    const {setCompanies} = useCompanies();
    const {isOpen: isEditModalOpen, onOpen: onOpenEditModal, onOpenChange: onOpenChangeEditModal} = useDisclosure();
    const router = useRouter();

    const deleteCompany = async () => {
        const originUrl = window.location.origin;
        if(!sessinon?.user.id || !originUrl) return
        setIsDeleteing(true);
        try{
            const response = await fetch(`${originUrl}/api/v1/${sessinon.user.id}/companies/${company.id}/delete`, {
                method: "DELETE",
            })

            if(!response.ok){
                const errorData = await response.json();
                const errorMessage = errorData?.error || "Failed to delete company";
                throw new Error(errorMessage);
            }

            setIsDeleteing(false);
            setCompanies((prevCompanies) => {
                if(!prevCompanies) return prevCompanies;
                return prevCompanies.filter((c) => c.id !== company.id);
            });
            toast.success("Company deleted successfully");
        }
        catch(error){
            console.log(error);
            if(error instanceof Error){
                toast.error(error.message);
            }
            else{
                toast.error("Something went wrong");
            }
        }
    };

    const handleAction = (key: Key) => {
        switch (key) {
            case "delete":
                deleteCompany();
                break;
            case "view":
                router.push(`/dashboard/${company.id}`);
                break;
            case "edit":
                onOpenEditModal();
                break;
            default:
                toast.error("Something went wrong");
                break;
        }
    };

    return (
        <div className={cn("w-96 h-48 border-1 cursor-pointer group hover:scale-[101%] border-white/20 p-5 bg-white/5 hover:bg-white/10 transition-all ease-linear rounded-lg flex flex-col justify-between", isDeleteing && "pointer-events-none opacity-50 animate-pulse")}>
            <div className="w-full flex items-start justify-between"> 
                <div className="flex items-center gap-3">
                    <Avatar
                        src={company.logo || undefined}
                        name={company.name}
                        size="lg"
                        className="flex-shrink-0 bg-gradient-to-br from-light_blue to-light_blue-500 text-dark_blue" 
                    />
                    <div className="flex flex-col">
                        <h1 className="text-light_blue text-md font-[400] uppercase">{company.name}</h1>
                        {company.industry && <span className="text-white/60 text-xs">{company.industry}</span>}
                        <h1 className="text-white/50 text-sm mt-1">{company.workers} workers</h1> 
                    </div>
                </div>
                <div className="flex items-center">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button 
                                variant="light" 
                                isIconOnly 
                                className="bg-transparent p-0 min-w-0"
                                size="sm"
                            >
                                <BsThreeDotsVertical size={20} className="text-white/50 hover:text-white/80" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu 
                            aria-label="Company Actions" 
                            items={dropdownItems}
                            onAction={handleAction}
                            disabledKeys={isDeleteing ? ["delete"] : []}
                        >
                            {(item) => (
                                <DropdownItem
                                    key={item.key}
                                    className={item.key === "delete" ? "text-danger" : ""}
                                    color={item.key === "delete" ? "danger" : "default"}
                                >
                                    {item.label}
                                </DropdownItem>
                            )}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            <div>
                <h4 className="text-white/50 text-sm">Linked DataBase: {company.database ? company.database.name: "Shared Database (free)"}</h4>
                <h4 className="text-white/50 text-sm">Created on {formatShortDate(company.created_at)}</h4>
            </div>

            <EditCompanyModal 
                isOpen={isEditModalOpen} 
                onOpenChange={onOpenChangeEditModal}
                company={company}
            />
        </div>
    );
}