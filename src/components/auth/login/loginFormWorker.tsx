"use client"
import { Button, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import { signIn } from "next-auth/react"
import SelectCompany from "./selectCompany";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function LoginFormWorker() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [company, setCompany] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const router = useRouter();

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if(company === "" || email === "" || password === ""){
            setError("Please fill all the fields")
            return
        }
        
        setLoading(true)
        signIn("credentials", { email, password, company, redirect: false })
        .then((callback) => {
            if(callback?.error){
                setError(callback.error)
            }
            else{
                console.log(callback)
                router.push("/")
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
        
        <form onSubmit={submitHandler} className="w-[500px] max-h-[620px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md  bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-6">
            <p className="text-white text-center w-full text-2xl ">Please enter your account details</p>
            <SelectCompany onSelectionChange={(value) =>{
                if(value) setCompany(value);
            }}/>
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
            <Button type="submit" size="md" isLoading={loading} radius="sm" isDisabled={loading} className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0">Login</Button>
        </form>
    );
}