"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
    Alert,
} from "@heroui/react";
import { Input } from "@heroui/react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";


export default function DeleteAccountButton() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [password, setPassword] = useState("");
    const [isPasswordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error !== "") setError("");
    }

    const handleDeleteAccount = async () => {

        if (!password) {
            setError("Please enter your password to confirm");
            toast.error("Please enter your password to confirm");
            return;
        }

        setLoading(true);
        setError("");
        const origin = window.location.origin

        try {
            const response = await fetch(`${origin}/api/dashboard/deleteAccount?password=${password}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                if (response.status === 403) {
                    setError("Incorrect password");
                    toast.error("Incorrect password");
                } else if (response.status === 404) {
                    setError("User account not found");
                    toast.error("User account not found");
                } else {
                    setError(errorData.error || "Something went wrong");
                    toast.error(errorData.error || "Something went wrong");
                }
                return;
            }

            toast.success("Account successfully deleted");
            await signOut();
            router.push("/");
            
        } catch (err) {
            console.error("Error deleting account:", err);
            setError("Network error. Please try again later.");
            toast.error("Network error. Please try again later.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button onPress={onOpen} radius="sm" color="danger" variant="solid" className="text-danger-500 bg-danger-500/30 font-semibold my-4">
                Delete Account
            </Button>
            <Modal 
                isOpen={isOpen} 
                onOpenChange={onOpenChange}
                classNames={{
                    base: "bg-modal_bg border rounded-lg border-white/20",
                    header: "text-light_blue-500 border-b border-white/20",
                    body: "pt-6",
                    closeButton: "text-white/60 hover:text-white/80"
                }}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 text-danger-500">Delete account</ModalHeader>
                            <ModalBody className="flex flex-col gap-4">
                                <p className="text-white/60">
                                    We`re sorry to see you go. Deleting your account is permanent and cannot be undone. All your data, including profile information, history, and saved content will be permanently removed.
                                </p>

                                <Alert 
                                    radius="sm" 
                                    color="danger" 
                                    className="dark" 
                                    description="This action is irreversible. All your data will be permanently deleted." 
                                    title="Warning" 
                                />

                                <Input 
                                    radius="sm" 
                                    className="dark text-white" 
                                    variant="bordered" 
                                    type={isPasswordVisible ? "text" : "password"}
                                    placeholder="Please enter your password to confirm" 
                                    value={password}
                                    onChange={handlePasswordChange}
                                    isInvalid={!!error} 
                                    errorMessage={error}
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
                            </ModalBody>
                            <ModalFooter className="flex items-center gap-4">
                                <Button 
                                    className="text-light_blue dark" 
                                    variant="light" 
                                    onPress={onClose}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    radius="sm" 
                                    isDisabled={loading || !password} 
                                    isLoading={loading}
                                    onPress={handleDeleteAccount} 
                                    color="danger" 
                                    variant="solid" 
                                    className="text-danger-500 bg-danger-500/30 font-semibold"
                                >
                                    Delete Account
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}