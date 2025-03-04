"use client"
import Link from "next/link";
import LogoutButton from "./logoutButton";
import { useSidBar } from "./contexts/sideBarContext";

export default function CompanySideBar({companyId}:{companyId: string}){

    const {isOpen, setIsOpen} = useSidBar();

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div className={`
                fixed md:sticky inset-y-0 left-0 z-40 
                w-[257px] h-screen flex flex-col border-r border-white/20 bg-modal_bg
                md:bg-transparent
                transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:translate-x-0
            `}>
                <div className="w-full h-[50px] border-b border-b-white/20 flex items-center px-5">
                    <h1 className="text-white text-lg ml-16 md:ml-0">Dashboard</h1>
                </div>
                
                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">User & Account Management</h1>
                    <Link href={`/dashboard/${companyId}/users`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Users
                    </Link>
                    <Link href={`/dashboard/${companyId}/groups`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Groups
                    </Link>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Audit Logs
                    </Link>
                </div>
                
                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">Task & Workflow</h1>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        TO-DO
                    </Link>
                </div>

                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">Tools & Utilities</h1>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        AI
                    </Link>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Docs
                    </Link>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        CLI
                    </Link>
                </div>
                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">Insights & Monitoring</h1>
                    <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Analytics
                    </Link>
                </div>
                
                <div>
                    <LogoutButton />
                </div>


            </div>
            
            {/* Overlay for mobile - closes sidebar when clicking outside */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden" 
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}
        </>
    );
}