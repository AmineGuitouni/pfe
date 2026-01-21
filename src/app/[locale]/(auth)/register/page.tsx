import RegisterForm from "@/features/auth/register/registerForm";

export default function RegisterPage(){
    return (
        <div className="w-full h-full overflow-y-auto scrollbar-custom flex justify-center items-center px-2 sm:px-5">
            <RegisterForm/>
        </div>
    )
}