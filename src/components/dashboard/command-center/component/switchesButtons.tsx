"use client";

import { MessageCircle, Terminal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SwitchesButtons({comapny_id}: {comapny_id: string}) {
    const pathName = usePathname();
    const mode = pathName.split("/").pop()

    if(mode !== 'cli' && mode !== 'chat') {
        return (
            <>
                <Link
                    href={`/dashboard/${comapny_id}/command-center/chat`}
                    className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-light_blue-500/10 text-light_blue hover:bg-light_blue-500/20 transition-colors"
                    title={`Switch to 'Chat' mode`}
                >
                    <MessageCircle size={16} /> Chat Mode
                </Link>

                <Link
                    href={`/dashboard/${comapny_id}/command-center/cli`}
                    className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-light_blue-500/10 text-light_blue hover:bg-light_blue-500/20 transition-colors"
                    title={`Switch to 'CLI' mode`}
                >
                    <Terminal size={16} /> CLI Mode
                </Link>
            </>
        )
    }

    return (
        <Link
            href={mode !== 'chat' ? `/dashboard/${comapny_id}/command-center/chat` : `/dashboard/${comapny_id}/command-center/cli`}
            className="flex items-center gap-2 px-3 py-1 rounded-md text-sm bg-light_blue-500/10 text-light_blue hover:bg-light_blue-500/20 transition-colors"
            title={`Switch to ${mode !== 'chat' ? 'CLI' : 'Chat'} mode`}
            replace
        >
        {mode !== 'chat' ? (
                <>
                    <MessageCircle size={16} /> Switch to Chat
                </>
            ) : (
                <>
                    <Terminal size={16} /> Switch to CLI
                </>
            )}
        </Link>
    )
}