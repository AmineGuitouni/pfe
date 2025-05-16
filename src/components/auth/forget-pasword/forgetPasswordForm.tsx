"use client";
import { Alert, Button, Input, Link } from "@heroui/react";
import React, { useState } from "react";
import NextLink from "next/link";


export default function ForgetPasswordForm() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);


    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
            setLoading(true);
            const res = await fetch(`/api/forget-password?email=${email}`)
            const data = await res.json();
            if(data.ok){
                setSuccess(true);
            }
            else{
                setError(true);
            }

        }
        catch(err){
            console.log(err)
        }
        finally{
            setLoading(false);
        }

    };


    const handleEmailChange = (value: string) => {
        setEmail(value);
        if (error) setError(false);
    };


    return (
        <form onSubmit={submitHandler} className="w-[500px] max-h-[570px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8 mt-20">
            <p className="text-white text-center w-full text-2xl">Enter your email</p>
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
            
            {
                !success ?
                <Button
                type="submit"
                size="md"
                isLoading={loading}
                radius="sm"
                isDisabled={loading} 
                className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
                >
                    Send email to reset password
                </Button> :
                
                <Alert description={"Please check your email"} title={"Success"} color="success" />
            }
            
            {error && <Alert description={"An error occured, please try again"} title={"Error"} color="danger"/>}
            
            <div className="w-full flex justify-center items-center gap-2">
                <p className="text-white text-medium">back to login page, </p>
                <Link href="/login" as={NextLink} underline="hover" className="text-light_blue-500 animate-pulse text-medium">
                    login
                </Link>
            </div>
        </form>
    );
}