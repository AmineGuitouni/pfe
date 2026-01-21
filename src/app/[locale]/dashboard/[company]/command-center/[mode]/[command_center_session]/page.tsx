import MessageList from "@/features/dashboard/command-center/component/MessageList";
import { ScrollShadow } from "@heroui/react";

export default function CommandCenterPage() {
    return (
        <ScrollShadow className="flex-grow overflow-y-auto w-full">
            <div className="h-fit mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28">
                <MessageList />
            </div>
        </ScrollShadow>
    );
}