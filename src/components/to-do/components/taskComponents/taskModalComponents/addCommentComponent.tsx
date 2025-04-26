"use client"
import { Button, User } from "@heroui/react";
import { useState } from "react";

export default function AddCommentComponent({addFunction,first_name,last_name }:{addFunction : (body: string,first_name: string,last_name: string) => void,first_name: string,last_name: string}){

    const [body,setBody] = useState("")
    const [loading,setLoading] = useState(false)
    const OnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try{
            setLoading(true)
            await addFunction(body,first_name,last_name)
        }
        catch(err){
            console.log(err)
        }
        finally{
            setLoading(false)
            setBody("")
        }
    }
    
    return(
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {OnSubmit(e)}}>
            <div className="flex space-x-3 items-start mb-2 ">
                    <User
                        avatarProps={{
                            name: first_name,
                        }}
                        name=""
                        className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                        <textarea
                            placeholder="Add a comment..."
                            value={body}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                            className="w-full border border-light_blue-500/20 bg-white/5 text-white placeholder-gray-400 rounded-lg shadow-sm focus:border-light_blue-500 focus:ring-light_blue-500 sm:text-sm p-2 mb-2" // Use design colors
                            rows={3}
                        />
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                className="bg-light_blue text-dark_blue rounded-lg" 
                                disabled={!body.trim() || loading}
                                isLoading={loading}
                            >
                                Post Comment
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
    )
}