import { i18nRouter } from 'next-i18n-router';
import i18nConfig from '../i18config';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

const authPages = ['/login', '/register'];
const publicPages = ["/"];

function getPath(path: string) {
  let list = path.split('/');
  if(list.length > 1 && i18nConfig.locales.includes(list[1])){
    list = [list[0], ...list.slice(2)];
  }
  if(list.length === 1) return "/";
  return list.join("/")
}

export async function middleware(request: NextRequest) {
  // return i18nRouter(request, i18nConfig); // <<-- kan t7eb twa9ef el middleware na7 el comment mn el star hadha
  const token = await getToken({req: request})
  const path = getPath(request.nextUrl.pathname);

  console.log(token);

  if(!token){
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
  }else{
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

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};