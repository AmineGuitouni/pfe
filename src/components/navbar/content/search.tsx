import { Button, Input } from "@heroui/react";
import { IoSearchOutline } from "react-icons/io5";

export default function Search() {
    return (
        <>

            <Button className="lg:hidden " size="lg" radius="full" isIconOnly variant="light" startContent={<IoSearchOutline size={23} className="mb-1 text-logo_color flex-shrink-0" />}></Button>

            <Input
                    placeholder="Search"
                    className="hidden lg:flex lg:w-[20%] xl:w-[40%] mt-1 mx-2 "
                    size="lg"
                    radius="full"
                    type="text"
                    endContent={<IoSearchOutline size={23} className="mb-1 text-logo_color flex-shrink-0" />}
                    variant="bordered"
            />

        </>
    )
}