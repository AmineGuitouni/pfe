"use client";
import { Button, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
import SelectCompany from "./selectCompany";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

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

        setError("");
        setLoading(true);

        if (company === "" || email === "" || password === "") {
            setError("Please fill all the fields");
            setLoading(false);
            return;
        }

        signIn("credentials", { email, password, company, redirect: false })
            .then((callback) => {
                if (callback?.error) {
                    setError(callback.error); 
                } else {
                    router.push("/");
                    router.refresh();
                }
            })
            .catch((err) => {
                console.error("Error during sign-in:", err);
                setError("An error occurred during sign-in"); 
            })
            .finally(() => {
                setLoading(false); 
            });
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (error) setError("");
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        if (error) setError(""); 
    };

    const handleCompanyChange = (value: string) => {
        setCompany(value);
        if (error) setError(""); 
    };

    return (
        <form onSubmit={submitHandler} className="w-[500px] max-h-[620px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-6 mt-20">
            <p className="text-white text-center w-full text-2xl">Please enter your account details</p>
            <SelectCompany
                onSelectionChange={(value) => {
                    if (value) handleCompanyChange(value);
                }}
            />
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Email"
                type="email"
                value={email}
                onValueChange={handleEmailChange} 
                errorMessage={error && "Invalid credentials"}
                isInvalid={error !== ""}
            />
            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={handlePasswordChange} 
                errorMessage={error && "Invalid credentials"}
                isInvalid={error !== ""}
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
        </form>
    );
}