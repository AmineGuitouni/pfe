"use client"
import { Button,Input} from "@heroui/react";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";


const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    const errors = [
        !minLength && "Password must be at least 8 characters long",
        !hasUpperCase && "Password must contain at least one uppercase letter",
        !hasLowerCase && "Password must contain at least one lowercase letter",
        !hasNumber && "Password must contain at least one number",
        !hasSpecialChar && "Password must contain at least one special character",
    ].filter(Boolean);

    return {
        isValid: errors.length === 0,
        errors
    };
};

const isValidPhoneNumber = (phoneNumber: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
};

export default function AddUserForm({ token }: { token: string | null }) {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        country: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [loading, setLoading] = useState(false);
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const router = useRouter();

    const handleChange = (field: string) => (value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        // Name validation
        if (formData.firstName.length < 2 || formData.firstName.length > 50) {
            newErrors.firstName = "First name must be between 2 and 50 characters";
        }

        if (formData.lastName.length < 2 || formData.lastName.length > 50) {
            newErrors.lastName = "Last name must be between 2 and 50 characters";
        }

        // Country validation
        if (!formData.country.trim()) {
            newErrors.country = "Country is required";
        }


        // Phone number validation
        if (!isValidPhoneNumber(formData.phoneNumber)) {
            newErrors.phoneNumber = "Invalid phone number format (e.g., +1234567890)";
        }

        // Password validation
        const passwordValidation = validatePassword(formData.password);
        if (!passwordValidation.isValid) {
            newErrors.password = passwordValidation.errors.join(". ");
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage("");
        
        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const originUrl = window.location.origin;
            
            const response = await fetch(`${originUrl}/api/register/worker`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    country: formData.country,
                    phone_number: formData.phoneNumber,
                    password: formData.password
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Handle field-specific errors from API
                if (data.field && data.error) {
                    setErrors(prev => ({
                        ...prev,
                        [data.field]: data.error
                    }));
                    return;
                }
                toast.error('Registration failed');
                throw new Error(data.error || 'Registration failed');
            }

            // Show success message
            toast.success("Registration successful !");
            
            router.push('/');

        } catch (err) {
            setErrors(prev => ({
                ...prev,
                submit: err instanceof Error ? err.message : 'An error occurred during registration'
            }));
            toast.error('An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={submitHandler} className="flex flex-col justify-center items-start gap-4">
            
            <div className="w-full flex gap-4">
                <Input
                    isRequired
                    className="w-full"
                    size="sm"
                    label="First Name"
                    value={formData.firstName}
                    onValueChange={handleChange('firstName')}
                    errorMessage={errors.firstName}
                    isInvalid={!!errors.firstName}
                />
                <Input
                    isRequired
                    className="w-full"
                    size="sm"
                    label="Last Name"
                    value={formData.lastName}
                    onValueChange={handleChange('lastName')}
                    errorMessage={errors.lastName}
                    isInvalid={!!errors.lastName}
                />
            </div>

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Country"
                value={formData.country}
                onValueChange={handleChange('country')}
                errorMessage={errors.country}
                isInvalid={!!errors.country}
            />

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Phone Number"
                type="tel"
                value={formData.phoneNumber}
                onValueChange={handleChange('phoneNumber')}
                placeholder="+1234567890"
                errorMessage={errors.phoneNumber}
                isInvalid={!!errors.phoneNumber}
            />

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Password"
                type={isPasswordVisible ? "text" : "password"}
                value={formData.password}
                onValueChange={handleChange('password')}
                errorMessage={errors.password}
                isInvalid={!!errors.password}
                endContent={!isPasswordVisible ? <FaEyeSlash onClick={() => setPasswordVisible(!isPasswordVisible)} size={20} className="mb-1 text-default-500 flex-shrink-0 cursor-pointer" /> : <FaEye onClick={() => setPasswordVisible(!isPasswordVisible)} size={20} className="mb-1 text-default-500 flex-shrink-0 cursor-pointer" />}
            />

            <Input
                isRequired
                className="w-full"
                size="sm"
                label="Confirm Password"
                type={isPasswordVisible ? "text" : "password"}
                value={formData.confirmPassword}
                onValueChange={handleChange('confirmPassword')}
                errorMessage={errors.confirmPassword}
                isInvalid={!!errors.confirmPassword}
            />

            {errors.submit && (
                <p className="text-red-500 text-sm text-center w-full">{errors.submit}</p>
            )}

            {successMessage && (
                <p className="text-green-500 text-sm text-center w-full">{successMessage}</p>
            )}

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
        </form>
    );
}