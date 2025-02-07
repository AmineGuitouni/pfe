"use client"
import { Button, Divider, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [country, setCountry] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);

    const router = useRouter();

    const validatePhoneNumber = (number: string) => {
        const regex = /^\+?[1-9]\d{1,14}$/; // E.164 format
        return regex.test(number);
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!validatePhoneNumber(phoneNumber)) {
            setError("Invalid phone number format");
            return;
        }

        setLoading(true);

        try {
            const originUrl = window.location.origin
            
            const response = await fetch(`${originUrl}/api/register/admin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    country,
                    email,
                    phone_number: phoneNumber,
                    password
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            router.push("/");

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitHandler} className="w-[500px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md  bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8">
            <p className="text-white text-center w-full text-2xl">Create your account</p>
            
            <div className="w-full flex gap-4">
                <Input
                    isRequired
                    className="w-full"
                    size="sm"
                    label="First Name"
                    value={firstName}
                    onValueChange={setFirstName}
                />
                <Input
                    isRequired
                    className="w-full"
                    size="sm"
                    label="Last Name"
                    value={lastName}
                    onValueChange={setLastName}
                />
            </div>

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Country"
                value={country}
                onValueChange={setCountry}
            />

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
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onValueChange={setPhoneNumber}
                placeholder="+1234567890"
            />

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
            />

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Confirm Password"
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onValueChange={setConfirmPassword}
            />

            <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="showPassword"
                        onChange={(e) => setPasswordVisible(e.target.checked)}
                    />
                    <label htmlFor="showPassword" className="text-white text-sm">
                        Show passwords
                    </label>
                </div>
                <Link href="#" as={NextLink} underline="hover" className="text-white text-medium">Forgot password?</Link>
            </div>

            {error && <p className="text-red-500 text-sm text-center w-full">{error}</p>}

            <Button 
                type="submit" 
                size="md"
                radius="sm"
                isLoading={loading}
                isDisabled={loading}
                className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
            >
                Register
            </Button>

            <div className="w-full shaded-edges overflow-hidden flex justify-center items-center">
                <Divider className="bg-white"/>
                <p className="text-white text-medium mx-2">or</p>
                <Divider className="bg-white"/>
            </div>

            <div className="w-full flex items-center justify-between gap-4">
                <Button 
                    size="md" 
                    radius="sm" 
                    variant="bordered" 
                    isDisabled={loading} 
                    className="border font-semibold w-full text-default-200 text-medium"
                >
                    Google
                </Button>
                <Button 
                    size="md" 
                    radius="sm" 
                    variant="bordered" 
                    isDisabled={loading} 
                    className="border font-semibold w-full text-default-200 text-medium"
                >
                    Github
                </Button>
            </div>

            <div className="w-full flex justify-center items-center gap-2">
                <p className="text-white text-medium">Already have an account?</p>
                <Link href="#" as={NextLink} underline="hover" className="text-light_blue-500 animate-pulse text-medium">Sign in</Link>
            </div>
        </form>
    );
}