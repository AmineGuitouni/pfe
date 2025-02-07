import LoginFormAdmin from "@/components/auth/login/loginFormAdmin";
import LoginFormWorker from "@/components/auth/login/loginFormWorker";
// import { authOptions } from "@/lib/auth/authOptions";
// import { getServerSession } from "next-auth";


export default async function page({ searchParams }: { searchParams: any }) {
    // console.log("searchParams", searchParams)
    // const session = await getServerSession(authOptions);
    // console.log("session", session)
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