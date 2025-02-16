"use client";
import { Button, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import NextLink from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginFormAdmin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const redirect = searchParams.get("redirect") || "/";

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(false);
        setLoading(true);

        signIn("credentials", { email, password, redirect: false })
            .then((callback) => {
                if (callback?.error) {
                    setError(true); 
                } else {
                    router.push(redirect);
                    router.refresh();
                }
            })
            .catch((err) => {
                console.error("Error during sign-in:", err);
                setError(true); 
            })
            .finally(() => {
                setLoading(false); 
            });
    };


    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (error) setError(false);
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (error) setError(false); 
    };

    return (
        <form onSubmit={submitHandler} className="w-[500px] max-h-[570px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8 mt-20">
            <p className="text-white text-center w-full text-2xl">Please enter your account details</p>
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Email"
                type="email"
                value={email}
                onValueChange={handleEmailChange} 
                errorMessage={"Invalid credentials"}
                isInvalid={error}
            />
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={handlePasswordChange} 
                errorMessage={"Invalid credentials"}
                isInvalid={error}
                endContent={
                    !isPasswordVisible ? (
                        <FaEyeSlash
                            onClick={() => setPasswordVisible(!isPasswordVisible)}
                            size={20}
                            className="mb-1 text-default-500 flex-shrink-0 cursor-pointer"
                        />
                    ) : (
                        <FaEye
                            onClick={() => setPasswordVisible(!isPasswordVisible)}
                            size={20}
                            className="mb-1 text-default-500 flex-shrink-0 cursor-pointer"
                        />
                    )
                }
            />
            <div className="w-full flex justify-end">
                <Link href="#" as={NextLink} underline="hover" className="text-white text-medium">
                    Forgot password?
                </Link>
            </div>
            <Button
                type="submit"
                size="md"
                isLoading={loading}
                radius="sm"
                isDisabled={loading} 
                className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
            >
                Login
            </Button>
            <div className="w-full flex justify-center items-center gap-2">
                <p className="text-white text-medium">Don`t have an account?</p>
                <Link href="/register" as={NextLink} underline="hover" className="text-light_blue-500 animate-pulse text-medium">
                    Sign up
                </Link>
            </div>
        </form>
    );
}