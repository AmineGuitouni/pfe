"use client"
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
    const [pageName, setPageName] = useState('');
    const path = usePathname();

    useEffect(() => {
        const segments = path.split('/');
        setPageName(segments[segments.length - 1]);
    }, [path]);

    return (
        <div className="w-full h-[50px] flex items-center px-5 border-b-1 border-white/20 flex-shrink-0">
            <h1 className="text-white/50 text-sm">{pageName}</h1>
        </div>
    );
}
