"use client";
import { Alert, Button, cn, Input } from "@heroui/react";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ChangePasswordForm({ token }: { token: string | null }) {
  const [oldPass, setOldPass] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (value: string) => {
    if (!value) {
      return "Password is required";
    }
    
    if (value.length < 8) {
      return "Password must be at least 8 characters long";
    }
    
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    
    if (!/[^A-Za-z0-9]/.test(value)) {
      return "Password must contain at least one special character";
    }
    
    return null;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value) {
      return "Please confirm your password";
    }
    
    if (value !== password) {
      return "Passwords do not match";
    }
    
    return null;
  };

  const submitHandler = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const passwordValidationError = validatePassword(password);
    const confirmValidationError = validateConfirmPassword(confirmPass);
    
    setPasswordError(passwordValidationError);
    setConfirmError(confirmValidationError);
    
    if (passwordValidationError || confirmValidationError) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/v1/preferences/change_password/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
          oldPassword: oldPass
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
    setPasswordError(null);
    // Update confirm password validation if it's not empty
    if (confirmPass) {
      setConfirmError(null);
    }
    if (error) setError(null);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPass(value);
    setConfirmError(null);
    if (error) setError(null);
  };

  const handleOldPasswordChange = (value: string) => {
    setOldPass(value);
    if (error) setError(null);
  };


  return (
    <form onSubmit={submitHandler} className="w-full flex flex-col justify-center items-start gap-8 ">
      <Input
        isRequired
        className="w-full"
        size="sm"
        label="Old password"
        type={"text"}
        value={oldPass}
        onValueChange={handleOldPasswordChange}
        errorMessage={error}
        isInvalid={!!error}
      />
      <Input
        isRequired
        className="w-full"
        size="sm"
        label="New password"
        type={isPasswordVisible ? "text" : "password"}
        value={password}
        onValueChange={handlePasswordChange}
        errorMessage={passwordError}
        isInvalid={!!passwordError}
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
      {/* {passwordMeetsRequirements && (
        <Alert
          className="w-full mt-2"
          description="Password meets all requirements"
          color="success"
        />
      )} */}
      <Input
        isRequired
        className="w-full"
        size="sm"
        label="Confirm new Password"
        type={isPasswordVisible ? "text" : "password"}
        value={confirmPass}
        onValueChange={handleConfirmPasswordChange}
        errorMessage={confirmError}
        isInvalid={!!confirmError}
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
        <Alert description={"Your password changed successfully"} color="success" />
      ) : (
        <Button
          type="submit"
          size="md"
          isLoading={loading}
          radius="sm"
          isDisabled={loading || !!passwordError || !!confirmError || !password || !confirmPass || !oldPass}
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