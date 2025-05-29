import Link from "next/link";
import { Button } from "@heroui/react";
import LoginButton from "./content/loginButton";
import Humburger from "./content/humburger/humburger";
import { Session } from "next-auth";
import DropDownMenu from "./content/dropDownMenu";
import Image from "next/image";
import LanguageChanger from "../languageChanger";
import { useTranslations } from 'next-intl';

export default function Nav({session}:{session : Session | null}){
    const t = useTranslations('navigation');
    
    const menuItems = [
        {name : t('menuItems.home'), href : "/"},
        {name : t('menuItems.pricing'), href : "/pricing"},
        {name : t('menuItems.contact'), href : "/contact"},
    ];

    return (
        <nav  className="bg-white/10 border-white/20 border-1 z-50 sticky top-10 w-[calc(100%-20px)] mx-auto sm:w-[calc(100%-40px)] lg:w-[calc(100%-200px)] max-w-[1920px]  rounded-full h-[60px] sm:mx-[20px] lg:mx-[100px] backdrop-blur flex justify-center items-center mb-20 sm:mb-28 ">
            <div className="relative  flex h-full w-[calc(100%-40px)] justify-between items-center sm:p-[20px] py-5 ">
            <Link href="/" className="" >
                <Image src="/digiGrowingLogo.png" alt="logo" width={100} height={100} className="w-[60px] h-[60px] "/>
            </Link>

            <div className="relative gap-6 justify-center items-center hidden md:flex ">
                
                {menuItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href}
                        className="text-xl text-white hover:text-light_blue-500 transition-all ease-linear "
                    >
                        {item.name} {item.href}
                    </Link>
                ))}
                
            </div>

            <div className="flex gap-2 sm:gap-6 items-center">

                <LanguageChanger />

                {!session ?
                <>
                    <LoginButton/>
                    <Button as={Link} href="/register" variant="bordered" className="border-light_blue/70 text-light_blue  rounded-xl text-sm md:text-md font-semibold">{t('buttons.signUp')}</Button>
                </>: <DropDownMenu session={session}/>
                }

            </div>

            <Humburger/>

            </div>

        </nav>
    );
}


