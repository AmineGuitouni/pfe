"use client"
import { Button, cn, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type User = {
    first_name: string;
    last_name: string;
    country: string;
    phone_number: string;
};

export default function ProfileInformation({className}:{className?:string}) {

    const {data: session , update} = useSession()
    const [user,setUser] = useState<User>({
        first_name: session?.user.first_name as string,
        last_name: session?.user.last_name as string,
        country: session?.user.country as string,
        phone_number: session?.user.phone_number as string
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        if (session?.user) {
            setUser({
                first_name: session.user.first_name || "",
                last_name: session.user.last_name || "",
                country: session.user.country || "",
                phone_number: session.user.phone_number || ""
            });
        }
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        
        if (!session?.user?.id) {
            setError("User not authenticated");
            return;
        }

        if (!user.first_name?.trim() || !user.last_name?.trim() || !user.country?.trim() || !user.phone_number?.trim()) {
            setError("credentials are required");
            return;
        }

        setLoading(true);
        
        try {
            const response = await fetch('/api/v1/preferences/profileInfo', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: session.user.id,
                    ...user
                }),
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            update(
                {
                    ...session.user,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    country: user.country,
                    phone_number: user.phone_number
                }
            )

            toast.success('Profile informations updated successfully');

        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return(
        <form onSubmit={handleUpdateProfile} className="w-full">
            <div className={cn("flex flex-col gap-4", className)}>
                <div className="flex justify-between items-center w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">First Name</span>
                    <Input
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder={user.first_name}
                        isInvalid={!!error}
                        errorMessage={error}
                        onChange={(e) => setUser({...user, first_name: e.target.value})}
                    />
                </div>
                <div className="flex justify-between items-center w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">Last Name</span>
                    <Input 
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder={user.last_name}
                        onChange={(e) => setUser({...user, last_name: e.target.value})}
                    />
                </div>
                <div className="flex justify-between items-center w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">Country</span>
                    <Input 
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder={user.country}
                        onChange={(e) => setUser({...user, country: e.target.value})}
                    />
                </div>
                <div className="flex justify-between items-center w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">Phone number</span>
                    <Input 
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder={user.phone_number}
                        onChange={(e) => setUser({...user, phone_number: e.target.value})}
                    />
                </div>
            </div>
            <hr className="w-full border-white/20"/>
            <div className="w-full p-4 flex justify-end gap-4">
                <Button
                    size="sm"
                    radius="sm"
                    variant="light"
                    color="danger"
                    className="text-sm text-white/60"
                >
                    Cancel
                </Button>
                <Button
                    type = "submit"
                    isLoading={loading}
                    isDisabled={loading}
                    size="sm"
                    radius="sm"
                    color="primary"
                    className="bg-light_blue-500 text-dark_blue text-sm"
                >
                    Save
                </Button>
            </div>
        </form>
    )
}