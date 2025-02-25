"use client";
import { Alert, Button, cn, Input } from "@heroui/react";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from 'next/navigation';

export default function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPass) {
      setError("Passwords must match");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
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

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null); 
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPass(value);
    if (error) setError(null);
  };

  return (
    <form onSubmit={submitHandler} className="w-full flex flex-col justify-center items-start gap-8 ">
      <Input
        isRequired
        className="w-full"
        size="sm"
        label="Password"
        type={isPasswordVisible ? "text" : "password"}
        value={password}
        onValueChange={handlePasswordChange}
        errorMessage={error}  // Show error message from state
        isInvalid={!!error}  // Show error state if there is any error
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
      <Input
        isRequired
        className="w-full"
        size="sm"
        label="Confirm Password"
        type={isPasswordVisible ? "text" : "password"}
        value={confirmPass}
        onValueChange={handleConfirmPasswordChange}
        errorMessage={"Passwords must match"}  // Show error message if passwords don't match
        isInvalid={password !== confirmPass}  // Show error state if there is any error
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
      {success ? (
        <>
          <Alert description={"Your password changed succesfully"} color="success" />
          <Button
            onPress={() => router.push('/login?role=admin')}
            className={cn(
              "bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
            )}
          >
            Go to Login
          </Button>
        </>
      ) : (
        <Button
          type="submit"
          size="md"
          isLoading={loading}
          radius="sm"
          isDisabled={loading || password !== confirmPass}
          className={cn(
            "bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0",
            success && "bg-green-500",
            error && "bg-red-500"
          )}
        >
          Submit
        </Button>
      )}
    </form>
  );
}
