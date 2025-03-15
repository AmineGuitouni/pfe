import { JWT } from "next-auth/jwt";
import { NextResponse } from "next/server";

interface ApiMiddlewareOptions {
    path: string,
    token: JWT | null
}

export default function apiMiddleware({path, token}:ApiMiddlewareOptions) {
    console.log({path, token});
    return NextResponse.next();
}