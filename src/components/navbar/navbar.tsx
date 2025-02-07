import Link from "next/link";
import { Button } from "@heroui/react";
import LoginButton from "./content/loginButton";
import Humburger from "./content/humburger/humburger";

export const menuItems = [
    {name : "About" , href : "/about"},
    {name : "Pricing" , href : "/pricing"},
    {name : "Contact us" , href : "/contact"},
  ];

export default function Nav() {

  return (
    <nav  className="bg-white/10 border-white/20 border-1 z-50 sticky top-10 w-[calc(100%-20px)] mx-auto sm:w-[calc(100%-40px)] lg:w-[calc(100%-200px)] max-w-[1920px]  rounded-full h-[60px] sm:mx-[20px] lg:mx-[100px] backdrop-blur flex justify-center items-center mb-20 sm:mb-28 ">
        <div className="relative  flex h-full w-[calc(100%-40px)] justify-between items-center sm:p-[20px] py-5 ">
        <Link href="/" className="mb-1" >
            <h1 className="text-xl sm:text-2xl font-semibold text-white">Digi Growing</h1>
        </Link>

        <div className="relative gap-6 justify-center items-center hidden md:flex ">
            
            {menuItems.map((item, index) => (
                <Link
                    key={index}
                    href={item.href}
                    className="text-xl text-white hover:text-light_blue-500 transition-all ease-linear "
                >
                    {item.name}  
                </Link>
            ))}
             
        </div>

        <div className="flex gap-2 sm:gap-6 items-center">

            <LoginButton/>
            <Button  variant="bordered" className="border-light_blue/70 text-light_blue  rounded-xl text-sm md:text-md font-semibold">Sign up</Button>

        </div>

        <Humburger/>

        </div>

    </nav>
  );
}


