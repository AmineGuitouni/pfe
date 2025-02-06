"use client"
import { Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, User } from "@heroui/react";
import { HiOutlineLogout } from "react-icons/hi";
import { IoMdSettings } from "react-icons/io";
import { LuShoppingCart, LuUser } from "react-icons/lu";
import { VscFeedback } from "react-icons/vsc";

export default function DropDownMenu(){
    return (
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
            <User
                as="button"
                avatarProps={{
                isBordered: true,
                src: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
                }}
                className="transition-transform text-logo_color font-semibold"
                description="@tonyreichert"
                name="Tony Reichert"
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
                <p className="font-bold text-logo_color">@tonyreichert</p>
            </DropdownItem>
            <DropdownItem key="account" startContent={<LuUser size={23}   />} className="text-xl gap-2 items-center hover:text-logo_color transition-all ease-linear">
                    Account
            </DropdownItem>
            <DropdownItem key="cart" startContent={<LuShoppingCart size={23}  />} className="text-xl gap-2 items-center hover:text-logo_color transition-all ease-linear ">
                    Cart
            </DropdownItem>
            <DropdownItem key="settings" startContent={<IoMdSettings size={23}  />} className="text-xl gap-2 items-center hover:text-logo_color transition-all ease-linear">
                    Settings
            </DropdownItem>
            <DropdownItem startContent={<VscFeedback size={23}  />} key="help_and_feedback">Help & Feedback</DropdownItem>
            <DropdownItem startContent={<HiOutlineLogout size={23}  />} key="logout" color="danger">
                Log Out
            </DropdownItem>
            </DropdownMenu>
            </Dropdown>
    )
}