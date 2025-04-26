"use client"
import Link from "next/link";
import LogoutButton from "./logoutButton";
import { useSidBar } from "./contexts/sideBarContext";
import { Session } from "next-auth";


export default function CompanySideBar({companyId,session}:{companyId: string,session :Session | null}){

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
                flex-shrink-0
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
                    <Link href={`/dashboard/${companyId}/audit-logs`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Audit Logs
                    </Link>
                    {session?.user.role === "owner" && <Link href={"/dashboard/account"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Account
                    </Link>}
                </div>
                
                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">Task & Workflow</h1>
                    <Link href={`/dashboard/${companyId}/projects`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Projects
                    </Link>
                    <Link href={`/dashboard/${companyId}/to-do`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        TO-DO
                    </Link>
                </div>

                <div className="w-full border-b border-b-white/20 flex flex-col justify-start gap-4 py-5 px-5">
                    <h1 className="text-white/50 text-sm">Tools & Utilities</h1>
                    <Link href={`/dashboard/${companyId}/preferences`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Preferences
                    </Link>
                    <Link href={`/dashboard/${companyId}/files`} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">
                        Files
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