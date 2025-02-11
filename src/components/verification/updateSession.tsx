"use client"
import { Button } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UpdateSession() {
    const {data:session, update} = useSession();
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    const router = useRouter();

    const click = ()=>{
        if(!session || !session.user){
            setError(true)
            return
        }
        setIsLoading(true)
        update().then(() => {
            router.push('/')
        })
        .catch(()=>{
            setError(true)
        })
        .finally(()=>{
            setIsLoading(false)
        })
    }

    return (
        <Button 
            color={error ? "danger" : "success"}
            isLoading={isLoading}
            isDisabled={isLoading}
            size="lg"
            className="w-full font-semibold text-dark_blue"
            onPress={click}
          >
            Go to Dashboard
        </Button>
    )
}