"use client"
import { Button, Divider, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import NextLink from "next/link";
import { signIn } from "next-auth/react"
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginFormAdmin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true)

        signIn("credentials", { email, password, redirect: false })
        .then((callback) => {
            if(callback?.error){
                setError(callback.error)
            }
            else{
                router.push(redirect)
            }
        })
        .catch((err) => {
            console.log(err)
        })
        .finally(() => {
            setLoading(false)
        })
    }

    return (
        
        <form onSubmit={submitHandler} className="w-[500px] max-h-[570px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md  bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8">
            <p className="text-white text-center w-full text-2xl ">Please enter your account details</p>
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
            />
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
            />
            <div className="w-full flex justify-end">
                <Link href="#" as={NextLink} underline="hover" className="text-white text-medium ">Forgot password ?</Link>
            </div>
            <Button type="submit" size="md" isLoading={loading} radius="sm" isDisabled={loading} className="bg-light_blue-500 text-dark_blue   text-medium font-semibold w-full flex-shrink-0">Login</Button>
            <div className="w-full shaded-edges overflow-hidden flex justify-center items-center">
                <Divider className="bg-white  "/>
                <p className="text-white text-medium mx-2 ">or</p>
                <Divider className="bg-white "/>
            </div>
            <div className="w-full flex items-center  justify-between gap-4">
            <Button  size="md" radius="sm" variant="bordered" isDisabled={loading} className=" border  font-semibold w-full text-default-200 text-medium" startContent={<FcGoogle/>}>Google</Button>
            <Button size="md" radius="sm" variant="bordered" isDisabled={loading} className="border  font-semibold w-full  text-default-200 text-medium" startContent={<FaGithub className="text-black"/>}>Github</Button>
            </div>
            <div className="w-full flex justify-center items-center gap-2">
                <p className="text-white text-medium ">Don`t have an account ?</p>
                <Link href="#" as={NextLink} underline="hover" className="text-light_blue-500 animate-pulse text-medium ">Sign up</Link>
            </div>
            
        </form>
    );
}