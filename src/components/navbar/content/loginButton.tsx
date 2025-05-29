"use client"
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaUserTie } from "react-icons/fa";
import { FaUser } from "react-icons/fa6";
import { useTranslations } from 'next-intl';

export default function LoginButton() {
    const router = useRouter();
    const t = useTranslations('navigation.buttons');
    
    return(
        <Dropdown>
            <DropdownTrigger>
                <Button  className="bg-light_blue text-dark_blue  rounded-xl text-sm md:text-md font-semibold">{t('login')}</Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Static Actions" >
                <DropdownItem startContent={<FaUserTie className="text-dark_blue" />} key="admin" className="text-lg text-dark_blue" onPress={() => router.push("/login?role=admin")}>{t('asAdmin')}</DropdownItem>
                <DropdownItem onPress={() => router.push("/login?role=worker")} startContent={<FaUser className="text-dark_blue" />} key="worker" className="text-lg text-dark_blue">{t('asWorker')}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}