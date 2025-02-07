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

  return list.join("/")
}

export async function middleware(request: NextRequest) {
  // return i18nRouter(request, i18nConfig); // <<-- kan t7eb twa9ef el middleware na7 el comment mn el star hadha
  const token = await getToken({req: request})
  const path = getPath(request.nextUrl.pathname);

  console.log("middleware path", request.nextUrl.pathname)
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
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }else{

  }

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: '/((?!api|static|.*\\..*|_next).*)'
};