import LoginCart from "@/components/login/loginCart";
import LoginForm from "@/components/login/loginForm";

export default function page(){
    return (
        <div className="w-full h-screen p-10  bg-dark_grey flex justify-between">
            <LoginForm/>
            <LoginCart/>
        </div>
    )
}