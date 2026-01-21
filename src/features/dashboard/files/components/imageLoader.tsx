"use client";

import { useEffect, useState } from "react";
import { useFilesContext } from "../hooks/useFilesContext";
import { Image, Skeleton } from "@heroui/react";


export default function ImageLoader({file_id}:{file_id:string}) {
    const [isLoading, setIsLoading] = useState(true);
    const [link, setLink] = useState("");
    const { getFileDownloadLink } = useFilesContext();
    
    useEffect(()=>{
        setIsLoading(true);
        getFileDownloadLink(file_id)
        .then((link)=>{
            setLink(link);
        })
        .catch((error)=>{
            console.log(error);
        }).finally(()=>{
            setIsLoading(false);
        })
    },[file_id, getFileDownloadLink])

    return (
        <div className="size-[170px]">
            {
                isLoading ? 
                <Skeleton className="w-full h-full animate-pulse" /> :
                <Image src={link} alt="file" className="w-full h-full" />
            }
        </div>
    )
}