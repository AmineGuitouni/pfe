"use client"
import { BreadcrumbItem, Breadcrumbs } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidBar } from './sidebar/contexts/sideBarContext';
import { Menu, X } from 'lucide-react';

export default function Header() {
    const path = usePathname();
    const router = useRouter();
    const {isOpen, setIsOpen} = useSidBar();
    
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="dark w-full h-[50px] flex items-center px-5 border-b-1 border-white/20 flex-shrink-0">
            <button 
                onClick={toggleSidebar} 
                className="md:hidden z-50 p-2 mr-4 bg-gray-800 rounded-md text-white"
                aria-label={isOpen ? "Close menu" : "Open menu"}
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Breadcrumbs  onAction={(key)=>{
                router.push(path.split("/").slice(0, Number(key) + 1).join("/"))
            }}>
                {path.split("/").map((segment, index) => (
                    <BreadcrumbItem key={index}>{segment}</BreadcrumbItem>
                ))}
            </Breadcrumbs>
        </div>
    );
}
