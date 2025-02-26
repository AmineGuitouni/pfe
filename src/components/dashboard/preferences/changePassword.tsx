"use client"
import { Accordion, AccordionItem, Button, cn, Input } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ChangePassword({className}:{className?:string}) {
    
    const { data:session } = useSession();
    const [isLoading, setIsLoading] = useState(false);

    const sendEmailChangeMail = async () => {
    
            if(!session?.user.email){
                return
            }

            try{
                setIsLoading(true);
                const res = await fetch(`/api/v1/preferences/change_password/sendMail?email=${session.user.email}`, {method:"GET"})
                const data = await res.json();
                if(data.ok){
                    toast.success("Email send successfully")
                }
                else{
                    toast.error("Something went wrong")
                }
    
            }
            catch(err){
                console.log(err)
            }
            finally{
                setIsLoading(false);
            }
    
        };
    

    return(
        <form className={cn("flex flex-col gap-4", className)}>

            <div className="flex justify-between  w-full gap-3">
                <span className="text-white/60 text-sm flex-shrink-0">Password</span>
                <div className="w-[60%]">
                    <div className="flex items-center gap-4">
                        <Input
                            isDisabled
                            radius="sm"
                            variant="bordered"
                            value={"*******************"}
                            classNames={{
                                inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                                input:"text-white/70",
                            }}
                            placeholder="Enter your email"
                        />
                        <Button
                            isLoading={isLoading}
                            size="sm"
                            radius="sm"
                            color="primary"
                            className="bg-light_blue-500 text-dark_blue text-xs flex-shrink-0"
                            onPress={sendEmailChangeMail}
                        >
                            Change password
                        </Button>
                    </div>
                    <Accordion variant="light" itemClasses={{
                        base: "py-0 w-full",
                        title: "m-0",
                        content: "p-0 m-0"
                    }}>
                        <AccordionItem key="1" aria-label="tips" title={(
                            <span className="text-white/70 text-xs">
                                How can I change my password?
                            </span>
                        )}>
                            <ul className="text-white/60 text-xs ml-8 list-disc">
                                <li>{`Click on the "Change password" button.`}</li>
                                <li>{`An email will be sent to ${session && session.user ? session.user.email : undefined}.`}</li>
                                <li>{`Click on the link in the email.`}</li>
                                <li>{`Enter your new password.`}</li>
                                <li>{`Click on "confirm".`}</li>
                            </ul>
                        </AccordionItem>
                    </Accordion>
                </div>
            </div>
        </form>
    )
}