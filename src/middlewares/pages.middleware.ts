import { NextRequest, NextResponse } from "next/server";

export const authPages = ['/login', '/register', '/forget-password', '/reset-password'];
export const publicPages = ["/"];

export async function publicPagesMiddleware({path, request}:{path: string, request: NextRequest}) {
    let isAuthPage = false;
    authPages.forEach((page)=>{
        if(path.startsWith(page)){
        isAuthPage = true;
        }
    })
    
    if(!isAuthPage){
        let isPublicPage = false
        publicPages.forEach((page)=>{
        if(path === page){
            isPublicPage = true;
        }
        })
        
        if(!isPublicPage){
            const loginUrl = new URL('/login', request.url);
            const {search} = new URL(request.url);
            loginUrl.searchParams.set('redirect', path+search);
            loginUrl.searchParams.set("role", "admin");
            return NextResponse.redirect(loginUrl);
        }
    }
}