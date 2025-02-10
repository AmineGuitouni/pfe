"use client"
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react"
import { useState } from "react";

 

export default function ErrorAction(){
    const {data:session} = useSession();
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false)

    if(!session || !session.user){
        return null
    }

    const sendMail = ()=>{
        setIsLoading(true)
        fetch(`/api/register/admin?email=${session.user.email}`, {method:"GET"})
        .then((res) => res.json())
        .then((res)=>{
            if(res.error){
                setError(error)
            }
            else{
                setIsSent(true);
            }
        })
        .catch((err)=>{
            console.log(err)
        })
        .finally(()=>{
            setIsLoading(false)
        })
    }

    return (
        <Button 
            color={error != "" ? "danger" : isSent ? "success" : "primary"}
            size="lg"
            className="mt-4"
            onPress={sendMail}
            isDisabled={isLoading}
            isLoading={isLoading}
        >
            Resend Verification Email
        </Button>
    )
}