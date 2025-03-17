import { NextRequest, NextResponse } from "next/server";

export const authPages = ['/login', '/register', '/forget-password', '/reset-password'];
export const publicPages = ["/"];
export const protectedPages = ["/dashboard", "/provide_cv"];

export function protectedPagesMiddleware({path, request}:{path: string, request: NextRequest}) {

    const isProtectedPage = protectedPages.some(route => path === route || path.startsWith(`${route}/`));
    
    if (isProtectedPage) {
        return NextResponse.redirect(new URL(`/`, request.url));
    }
    
    return null;
}