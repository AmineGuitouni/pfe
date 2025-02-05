import LoginCart from "@/components/login/loginCart";
import LoginForm from "@/components/login/loginForm";

export default async function page(){
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