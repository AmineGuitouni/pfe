import { i18nRouter } from 'next-i18n-router';
import i18nConfig from '../i18config';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import apiMiddleware from './middlewares/api.middleware';
import { protectedPagesMiddleware } from './middlewares/pages.middleware';
import emailVerificationMiddleware from './middlewares/emailVerification.middleware';

function getPath(path: string) {
  let list = path.split('/');
  if(list.length > 1 && i18nConfig.locales.includes(list[1])){
    list = [list[0], ...list.slice(2)];
  }
  if(list.length === 1) return "/";
  return list.join("/")
}

export async function middleware(request: NextRequest) {
  const token = await getToken({req: request})
  const path = getPath(request.nextUrl.pathname);

  console.log({path});

  if(path.startsWith("/api")){
    return apiMiddleware({path, token});
  }
  
  // Handle unauthenticated users
  if(!token){
    const protectedPagesMiddlewareRes = protectedPagesMiddleware({path, request});
    if(protectedPagesMiddlewareRes){
      console.log(`route ${path} is protected`)
      return protectedPagesMiddlewareRes
    }
  } else {
    if(token.role === "worker") {
      const workerCompanyId = token.company_id;
      
      const isHome = path === "/";
      const provide_cv_path = path === `/provide_cv`;
      const isWorkerCompanyDashboard = path === `/dashboard/${workerCompanyId}` || 
                                      path.startsWith(`/dashboard/${workerCompanyId}/`);
      
      if(!isHome && !isWorkerCompanyDashboard && !provide_cv_path){ 
        return NextResponse.redirect(new URL(`/dashboard/${workerCompanyId}`, request.url));
      }
    }

    const emailVerificationMiddlewareRes = emailVerificationMiddleware({
      path,
      token,
      request
    })

    if(emailVerificationMiddlewareRes){
      return emailVerificationMiddlewareRes
    }
  }

  return i18nRouter(request, i18nConfig);
}

export const config = {
  matcher: '/((?!static|.*\\..*|_next).*)'
};