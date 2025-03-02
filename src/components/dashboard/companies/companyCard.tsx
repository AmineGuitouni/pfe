import { formatShortDate } from "@/lib/utils";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button } from "@heroui/react";
import { Key } from "react";

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

export default function CompanyCard({name, id, createdAt, database_name}:{name:string, id:string, createdAt:string, database_name:string}) {
    const handleAction = (key: Key) => {
        console.log(`${key} company with id: ${id}`);
    };

    return (
        <div className="w-96 h-48 border-1 cursor-pointer group hover:scale-[101%] border-white/20 p-5 bg-white/5 hover:bg-white/10 transition-all ease-linear rounded-lg flex flex-col justify-between">
            <div className="w-full flex items-start justify-between">
                <div className="flex flex-col">
                    <h1 className="text-light_blue text-md font-[400]">{name}</h1>
                    <h1 className="text-white/50 text-sm">?? workers</h1>
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
                <h4 className="text-white/50 text-sm">Linked DataBase: {database_name}</h4>
                <h4 className="text-white/50 text-sm">Created on {formatShortDate(createdAt)}</h4>
            </div>
        </div>
    );
}