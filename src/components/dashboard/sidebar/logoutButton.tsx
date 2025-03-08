"use client"
import { signOut } from "next-auth/react"
import { LuLogOut } from "react-icons/lu"

export default function LogoutButton() {
    return(
        <div onClick={() => {signOut({callbackUrl: "/"})}} className="w-full h-[50px] text-white group hover:text-danger-500 gap-2 transition-all ease-linear cursor-pointer border-b-1 border-b-white/20 flex items-center   px-5">
                <LuLogOut  />
                <h1 className="text-md">Log out</h1>
        </div>
    )
}