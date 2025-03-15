import { NextRequest, NextResponse } from "next/server";

export const authPages = ['/login', '/register', '/forget-password', '/reset-password'];
export const publicPages = ["/"];
export const protectedPages = ["/dashboard"]

export function protectedPagesMiddleware({path, request}:{path: string, request: NextRequest}) {
    for(const route in protectedPages){
        if(path.startsWith(route)){
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return null
}