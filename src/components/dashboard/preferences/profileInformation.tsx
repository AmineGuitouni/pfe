"use client"
import { Avatar, Button, cn, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdEdit } from "react-icons/md";

type User = {
    first_name: string;
    last_name: string;
    country: string;
    phone_number: string;
    image?: string;
};

export default function ProfileInformation({className}:{className?:string}) {

    const {data: session , update} = useSession()
    const [user,setUser] = useState<User>({
        first_name: session?.user.first_name as string,
        last_name: session?.user.last_name as string,
        country: session?.user.country as string,
        phone_number: session?.user.phone_number as string,
        image: session?.user.image as string
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState({filed : "", message : ""})
    const [avatarFile, setAvatarFile] = useState<File | null>(null)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null)
    const [uploadingAvatar, setUploadingAvatar] = useState(false)

    useEffect(() => {
        if (session?.user) {
            setUser({
                first_name: session.user.first_name || "",
                last_name: session.user.last_name || "",
                country: session.user.country || "",
                phone_number: session.user.phone_number || "",
                image: session.user.image || ""
            });
            setAvatarPreview(session.user.image || null);
        }
    }, [session]);

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setUploadingAvatar(true);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
                setAvatarFile(file);
            };
            reader.readAsDataURL(file);
            setUploadingAvatar(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {

        e.preventDefault();
        setError({filed : "", message : ""});
        
        if (!session?.user?.id) {
            setError({filed : "", message : "User not authenticated"});
            return;
        }

        if (!user.first_name?.trim() || !user.last_name?.trim() || !user.country?.trim() || !user.phone_number?.trim()) {
            setError({filed: "", message: "All fields are required"});
            return;
        }

        if (user.first_name.trim().length < 3) {
            setError({filed : "first_name", message : "First name must be at least 3 characters long"});
            return;
        }

        if (user.last_name.trim().length < 3) {
            setError({filed : "last_name", message : "Last name must be at least 3 characters long"});
            return;
        }

        if (user.country.trim().length < 2) {
            setError({filed : "country", message : "Country must be at least 2 characters long"});
            return;
        }

        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(user.phone_number.trim())) {
             setError({filed : "phone_number", message : "Invalid phone number format (e.g., +1234567890)"});
             return;
        }

        setLoading(true);

        
        
        try {
            const formData = new FormData();
            formData.append('id', session.user.id); 
            formData.append('first_name', user.first_name.trim());
            formData.append('last_name', user.last_name.trim());
            formData.append('country', user.country.trim());
            formData.append('phone_number', user.phone_number.trim());

            if (avatarFile) {
                formData.append('avatar', avatarFile); // Ensure 'avatar' matches backend expectation
            }

            let apiUrl = '';
            const origin = window.location.origin;

            if (session.user.role === "owner") {
                apiUrl = `${origin}/api/v1/preferences/profileInfo`;
            } else if (session.user.role === "worker") {
                apiUrl = `${origin}/api/v1/${session.user.id}/companies/${session.user.company_id}/preferences`;
            } else {
                 setError({filed : "", message : "Invalid user role."});
                 setLoading(false);
                 return;
            }

            const response = await fetch(apiUrl, {
                method: 'PUT',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Prepare data for session update
            const updatedSessionData: any = {
                 ...session.user,
                 first_name: user.first_name.trim(),
                 last_name: user.last_name.trim(),
                 country: user.country.trim(),
                 phone_number: user.phone_number.trim(),
                 role: session.user.role, // Keep existing role
            };

            // If the backend returns the new avatar URL, use it for session update
            if (data.avatar_url) {
                 updatedSessionData.image = data.avatar_url; 
                 setAvatarPreview(data.avatar_url); 
            }

            update(updatedSessionData); 
            setAvatarFile(null); 
            toast.success('Profile information updated successfully');

        } catch (err: any) { // Catch specific error type
            const errorMessage = err.message || 'Failed to update profile';
            setError({filed : "", message : errorMessage});
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Generate initials for avatar placeholder
    const getInitials = () => {
        const first = user.first_name?.charAt(0) || '';
        const last = user.last_name?.charAt(0) || '';
        return (first + last).toUpperCase();
    };

    return(
        <form onSubmit={handleUpdateProfile} className="w-full">
            <div className={cn("flex flex-col gap-6", className)}>
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-4 ">
                    {/* Make the container itself the click target */}
                    <label htmlFor="avatar-upload" className="relative group cursor-pointer">
                        <div className={cn(
                            "w-24 h-24 rounded-full overflow-hidden flex items-center justify-center text-xl font-medium",
                            "bg-gradient-to-br from-light_blue to-light_blue-500 text-dark_blue border-2 border-white/20",
                            "transition-all duration-300 group-hover:brightness-75" // Darken avatar on hover
                        )}>
                            {avatarPreview ? (
                                <Avatar
                                    src={avatarPreview}
                                    name={user.first_name +" " + user.last_name}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                    onError={() => setAvatarPreview(null)} // Reset to initials if image fails to load
                                />
                            ) : (
                                <span>{getInitials()}</span>
                            )}
                        </div>
                        
                        {/* Centered Icon Overlay */}
                        <div className={cn(
                                "absolute inset-0 flex items-center justify-center",
                                "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                "bg-black/40 rounded-full" // Semi-transparent background for icon visibility
                            )}
                        >
                            {uploadingAvatar ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> // Slightly larger spinner
                            ) : (
                                <MdEdit size={24} className="text-white"/> // White icon, larger size
                            )}
                        </div>
                    </label> {/* Add the missing closing label tag here */}
                    <input
                        id="avatar-upload"
                        type="file"
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleAvatarChange}
                            disabled={uploadingAvatar}
                        />
                    </div>
                {/* Remove the extra closing div below */}
                
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
                        value={user.first_name}
                        isInvalid={error.filed === "first_name"}
                        errorMessage={error.message}
                        onChange={(e) => {
                            setUser({...user, first_name: e.target.value})
                            setError({filed : "", message : ""});
                        }}
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
                        value={user.last_name}
                        isInvalid={error.filed === "last_name"}
                        errorMessage={error.message}
                        onChange={(e) => {setUser({...user, last_name: e.target.value}); setError({filed : "", message : ""})}}
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
                        value={user.country}
                        onChange={(e) => {setUser({...user, country: e.target.value}); setError({filed : "", message : ""})}}
                        isInvalid={error.filed === "country"}
                        errorMessage={error.message}
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
                        value={user.phone_number}
                        description="e.g., +1234567890"
                        onChange={(e) => {setUser({...user, phone_number: e.target.value}); setError({filed : "", message : ""})}}
                        isInvalid={error.filed === "phone_number"}
                        errorMessage={error.message}
                    />
                </div>
            </div>
            <hr className="w-full border-white/20 mt-6"/>
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
                    type="submit"
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