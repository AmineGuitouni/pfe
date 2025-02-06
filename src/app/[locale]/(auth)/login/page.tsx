import LoginCart from "@/components/auth/login/loginCart";
import LoginForm from "@/components/auth/login/loginFormAdmin";
import { authOptions } from "@/lib/auth/authOptions";
import { getServerSession } from "next-auth";

export default async function page(){
    const session = await getServerSession(authOptions);
    console.log("session", session)
    return (
        <div className="w-full h-screen p-10  bg-dark_grey flex justify-between">
            <div className="w-[40%] h-full flex flex-col pl-5">
                <p className="text-2xl text-white font-semibold">Digi Growing</p>
                <LoginForm/>
            </div>
            <LoginCart/>
        </div>
    )
}