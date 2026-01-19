"use client"
import { SessionProvider } from "next-auth/react"
import CvGateKeeper from "@/components/provide_cv/CvGateKeeper";

export default function AppSession({
    children,
    session,
  }:any){  

    return(
        <SessionProvider session={session}>
            <CvGateKeeper />
            {children}
        </SessionProvider>
    )
}