import LoginFormAdmin from "@/components/auth/login/loginFormAdmin";
import LoginFormWorker from "@/components/auth/login/loginFormWorker";

export default async function page({ searchParams }: { searchParams: any }) {
    
    return (
        <div className="w-full h-full flex justify-center items-center px-2 sm:px-5">
        {
            searchParams?.role === "admin" ?
                <LoginFormAdmin/> :
                <LoginFormWorker/>
        }
        </div>
    )
}