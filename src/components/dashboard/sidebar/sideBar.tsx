import Link from "next/link";
import LogoutButton from "./logoutButton";
export default function SideBar() {
    return (
        <div className="w-[257px] h-full flex  flex-col  border-r-1 border-white/20 ">
            <div className="w-full h-[50px] border-b-1 border-b-white/20 flex items-center   px-5">
                <h1 className="text-white text-lg">Dashboard</h1>
            </div>
            <div className="w-full border-b-1 border-b-white/20 flex flex-col justify-start gap-4 py-5  px-5">
                <h1 className="text-white/50 text-sm">General</h1>
                <Link href="/dashboard/account" className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Companies</Link>
                <Link href="/dashboard/account/databases" className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Databases</Link>
            </div>
            <div className="w-full border-b-1 border-b-white/20 flex flex-col justify-start gap-4 py-5  px-5">
                <h1 className="text-white/50 text-sm">Account</h1>
                <Link href="/dashboard/account/preferences" className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Preferences</Link>
                <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Access Tokens</Link>
                <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Security</Link>
                <Link href={"#"} className="text-white text-medium hover:text-light_blue-500 transition-all ease-linear">Audit Logs</Link>
            </div>
            <LogoutButton/>
        </div>
    )
}