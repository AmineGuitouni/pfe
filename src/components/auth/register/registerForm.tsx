"use client"
import { Button, Input } from "@heroui/react";
import React, { useState } from "react";

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
            console.log(response)
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            console.log('Registration successful:', data);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitHandler} className="w-full h-full flex flex-col justify-center items-start gap-5">
            <p className="text-white text-xl">Create your account</p>
            
            <div className="w-[70%] flex gap-4">
                <Input
                    isRequired
                    label="First Name"
                    value={firstName}
                    onValueChange={setFirstName}
                />
                <Input
                    isRequired
                    label="Last Name"
                    value={lastName}
                    onValueChange={setLastName}
                />
            </div>

            <Input
                isRequired
                className="w-[70%]"
                label="Country"
                value={country}
                onValueChange={setCountry}
            />

            <Input
                isRequired
                className="w-[70%]"
                label="Email"
                type="email"
                value={email}
                onValueChange={setEmail}
            />

            <Input
                isRequired
                className="w-[70%]"
                label="Phone Number"
                type="tel"
                value={phoneNumber}
                onValueChange={setPhoneNumber}
                placeholder="+1234567890"
            />

            <Input
                isRequired
                className="w-[70%]"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
            />

            <Input
                isRequired
                className="w-[70%]"
                label="Confirm Password"
                type={isPasswordVisible ? "text" : "password"}
                value={confirmPassword}
                onValueChange={setConfirmPassword}
            />

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="showPassword"
                    onChange={(e) => setPasswordVisible(e.target.checked)}
                />
                <label htmlFor="showPassword" className="text-sm">
                    Show passwords
                </label>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button 
                type="submit" 
                isLoading={loading}
                isDisabled={loading}
                className="w-[70%]"
            >
                Register
            </Button>
        </form>
    );
}