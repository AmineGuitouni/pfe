import { JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { authPages } from "./pages.middleware";

interface EmailVerificationMiddlewareOptions{
    path: string,
    token: JWT,
    request: NextRequest
}
export default function emailVerificationMiddleware({path, token, request}:EmailVerificationMiddlewareOptions){
    if(!token.email_verified && !path.startsWith("/verify")){
        return NextResponse.redirect(new URL('/verify', request.url));
    }

    if(token.email_verified && path.startsWith("/verify")){
        return NextResponse.redirect(new URL('/', request.url));
    }

    if(authPages.includes(path)){
        return NextResponse.redirect(new URL('/', request.url));
    }
}