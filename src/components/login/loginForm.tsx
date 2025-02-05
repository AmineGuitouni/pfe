import { Button, Input } from "@heroui/react";

export default function LoginForm() {
    return (
        <div className="w-[40%] h-full flex flex-col pl-5">
            <p className="text-2xl text-white font-semibold">Digi Growing</p>
            <div className="w-full h-full flex flex-col justify-center items-start gap-5">
                <p className="text-white text-xl ">Please enter your account details</p>
                <Input
                isRequired
                className="w-[70%] dark"
                label="Email"
                type="email"
                />
                <Input
                isRequired
                className="w-[70%] dark"
                label="password"
                type="password"
                />
                <Button className="w-[70%]">Login</Button>


            </div>
            
        </div>
    );
}