import { Button, cn, Input } from "@heroui/react";

export default function ProfileInformation({className}:{className?:string}) {
    return(
        <form className="w-full">
            <div className={cn("flex flex-col gap-4", className)}>
                <div className="flex justify-between w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">First Name</span>
                    <Input
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder="Enter your first name"
                    />
                </div>
                <div className="flex justify-between w-full gap-3">
                    <span className="text-white/60 text-sm flex-shrink-0">Last Name</span>
                    <Input 
                        radius="sm"
                        variant="bordered"
                        classNames={{
                            base:"w-[60%]",
                            inputWrapper:"border-1 border-white/20 focus-within:!border-white/50",
                            input:"text-white/70",
                        }}
                        placeholder="Enter your last name"
                    />
                </div>
            </div>
            <hr className="w-full border-white/20"/>
            <div className="w-full p-4 flex justify-end gap-4">
                <Button
                    size="sm"
                    radius="sm"
                    variant="light"
                    color="danger"
                    className="text-sm text-white/60"
                >
                    Cancel
                </Button>
                <Button
                    size="sm"
                    radius="sm"
                    color="primary"
                    className="bg-light_blue-500 text-dark_blue text-sm"
                >
                    Save
                </Button>
            </div>
        </form>
    )
}