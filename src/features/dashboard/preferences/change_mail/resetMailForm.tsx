"use client";
import { Alert, Button, cn, Input } from "@heroui/react";
import React, { useState } from "react";

export default function ResetPasswordForm({ token }: { token: string | null }) {

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "") {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/preferences/reset_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setError(null);
    } catch (error: any) {
      console.error("Password reset error:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(null); 
  };

  return (
    <form onSubmit={submitHandler} className="w-full flex flex-col justify-center items-start gap-8 ">
      <Input

        isRequired
        className="w-full"
        size="sm"
        label="email"
        type={"email"}
        value={email}
        onValueChange={handleEmailChange}
        errorMessage={error}  
        isInvalid={!!error}  
        
      />
      {success ?
      
      <Alert description={"Your email changed succesfully"}  color="success" /> :

      <Button
        type="submit"
        size="md"
        isLoading={loading}
        radius="sm"
        isDisabled={loading} 
        className={cn("bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0", success && "bg-green-500", error && "bg-red-500")}
      >
        Submit
      </Button>}
    </form>
  );
}
