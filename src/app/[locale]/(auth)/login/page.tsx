import LoginFormAdmin from "@/components/auth/login/loginFormAdmin";
import LoginFormWorker from "@/components/auth/login/loginFormWorker";
import Link from "next/link";
// import { authOptions } from "@/lib/auth/authOptions";
// import { getServerSession } from "next-auth";


export default async function page({ searchParams }: { searchParams: any }) {
    // console.log("searchParams", searchParams)
    // const session = await getServerSession(authOptions);
    // console.log("session", session)
    return (
        <div className=" w-full h-full p-14 bg-dark_grey flex justify-center items-center ">
            <div className="w-[40vw] h-[40vw] max-w-[800px] max-h-[800px]  fixed left-1/2  -translate-x-1/2  blur-3xl  bg-light_blue-500/10 rounded-full"></div>
            <div className="w-full h-full flex flex-col  ">
                <Link href={"/"} className="text-2xl text-white font-semibold z-10 w-full text-center sm:text-start">Digi Growing</Link>
                <div className="w-full h-full flex justify-center items-center px-5">
                {
                    searchParams?.role === "admin" ?
                        <LoginFormAdmin/> :
                        <LoginFormWorker/>
                }
                </div>
            </div>
        </div>
    )
}