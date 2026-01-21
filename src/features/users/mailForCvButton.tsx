"use client"
import { Button } from "@heroui/react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function MailForCvButton({email}:{email:string}) {

    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const re =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const sendEmail = async () => {
        setLoading(true);
        try {

            const check = validateEmail(email)

            if(!check){
                toast.error("the email is not valid");
                return;
            }
            
            const origin = window.location.origin
            const response = await fetch(`${origin}/api/cv_reminder?email=${email}`, {
                method: "GET",
            });
            if (response.ok) {
                toast.success("Email sent successfully");
            } else {
                toast.error("Failed to send email");
            }
        } catch (error) {
            console.error("Error sending email:", error);
        }
        finally{
            setLoading(false);
        }
    }

    return (
        <Button isLoading={loading} isDisabled={loading} onPress={sendEmail} className="bg-light_blue  text-dark_blue font-semibold px-4 rounded-md">
            Send Reminder Email
        </Button>
    );
}