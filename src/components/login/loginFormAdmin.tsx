"use client"
import { Button, Input } from "@heroui/react";
import React, { useState } from "react";
import { signIn } from "next-auth/react"

export default function LoginFormAdmin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true)

        signIn("credentials", { email, password, redirect: false })
        .then((callback) => {
            if(callback?.error){
                setError(callback.error)
            }
            else{
                console.log(callback)
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
        
        <form onSubmit={submitHandler} className="w-full h-full flex flex-col justify-center items-start gap-5">
            <p className="text-white text-xl ">Please enter your account details</p>
            <Input
                isRequired
                className="w-[70%] dark"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
            />
            <Input
                isRequired
                className="w-[70%] dark"
                label="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
            />
            <Button type="submit" isLoading={loading} isDisabled={loading} className="w-[70%]">Login</Button>
        </form>
    );
}