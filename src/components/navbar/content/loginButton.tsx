"use client"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaUserTie } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";

export default function LoginButton() {
    const router = useRouter();
    return(
        <Dropdown>
            <DropdownTrigger>
                <Button  className="bg-light_blue text-dark_blue  rounded-xl text-sm md:text-md font-semibold">Login</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions" >
                <DropdownItem startContent={<FaUserTie className="text-dark_blue" />} key="admin" className="text-lg text-dark_blue" onPress={() => router.push("/login?role=admin")}>As admin</DropdownItem>
                <DropdownItem onPress={() => router.push("/login?role=worker")} startContent={<FaUser className="text-dark_blue" />} key="worker" className="text-lg text-dark_blue">As worker</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}