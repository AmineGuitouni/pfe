"use client"
import { BreadcrumbItem, Breadcrumbs, User } from '@heroui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useSidBar } from './sidebar/contexts/sideBarContext';
import { Menu, X } from 'lucide-react';


export default function Header({session} : {session: any}) {
    const path = usePathname();
    const router = useRouter();
    const {isOpen, setIsOpen} = useSidBar();
    
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    let pathList = path.split("/")
    const startIndex = pathList.indexOf("dashboard") + 1;
    pathList = pathList.slice(startIndex);

    return (
        <div className="dark w-full h-[50px] flex items-center justify-between px-5 border-b-1 border-white/20 flex-shrink-0">
            <div className='flex items-center gap-4'>
                <button 
                    onClick={toggleSidebar} 
                    className="md:hidden z-50 p-2 mr-4 bg-gray-800 rounded-md text-white"
                    aria-label={isOpen ? "Close menu" : "Open menu"}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <Breadcrumbs  onAction={(key)=>{
                    router.push(path.split("/").slice(0, Number(key) + 1 + startIndex).join("/"))
                }}>
                    {pathList.map((segment, index) =>{
                        if (segment.length>15) return (
                            <BreadcrumbItem key={index}>Company</BreadcrumbItem>
                        )
                        return (
                        <BreadcrumbItem key={index}>{segment}</BreadcrumbItem>
                    )})}
                </Breadcrumbs>
            </div>

            <User
                avatarProps={{
                    name: session?.user.name as string,
                    src: session?.user.image ? session.user.image : undefined,
                    className: "w-3 h-3 sm:w-8 sm:h-8 rounded-full border border-white/20 shadow-lg"
                }}
                className="transition-transform text-light_blue-500 font-semibold"
                description={session?.user.email}
                name={session?.user.name}
                classNames={
                    {
                        name:"hidden sm:block text-[11px]",
                        description:"hidden sm:block text-[10px]"
                    }
                }
            />
            
        </div>
    );
}
