"use client"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { HiOutlineLogout } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import {  LuUser } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";

export default function DropDownMenu(){
    const {data:session} = useSession();
    if(!session || !session.user){
        return null
    }

    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
            <User
                as="button"
                avatarProps={{
                    name: session.user.name as string,
                    //isBordered: true,
                    src: session.user.image ? session.user.image : undefined,
                }}
                className="transition-transform text-light_blue-500 font-semibold"
                description={session.user.email}
                name={session.user.name}
                classNames={
                    {
                        name:"hidden sm:block",
                        description:"hidden sm:block"
                    }
                }
            />
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-bold">Signed in as</p>
                <p className="font-bold text-light_blue-500">{session.user.email}</p>
            </DropdownItem>
            <DropdownItem key="account" startContent={<LuUser size={23}   />} className="text-xl gap-2 items-center hover:text-light_blue-500 transition-all ease-linear">
                    Account
            </DropdownItem>
            <DropdownItem key="settings" startContent={<IoMdSettings size={23}  />} className="text-xl gap-2 items-center hover:text-light_blue-500 transition-all ease-linear">
                    Settings
            </DropdownItem>
            <DropdownItem startContent={<VscFeedback size={23}  />} key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem onPress={()=>signOut()} startContent={<HiOutlineLogout size={23}  />} key="logout" color="danger">
                Log Out
            </DropdownItem>
            </DropdownMenu>
            </Dropdown>
    )
}