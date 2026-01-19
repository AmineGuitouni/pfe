import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import apiMiddleware from './middlewares/api.middleware';
import { protectedPagesMiddleware } from './middlewares/pages.middleware';
import emailVerificationMiddleware from './middlewares/emailVerification.middleware';
import checkCvProvided from './middlewares/checkCvProvided';

function getPath(path: string) {
  let list = path.split('/');
  if(list.length > 1 && routing.locales.includes(list[1] as any)){
    list = [list[0], ...list.slice(2)];
  }
  if(list.length === 1) return "/";
  return list.join("/")
}

export async function middleware(request: NextRequest) {
  // return i18nRouter(request, i18nConfig);
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })
  
  const path = getPath(request.nextUrl.pathname);
  if(path.startsWith("/api")){
    return await apiMiddleware({path, token, request});
  }
  
  // Handle unauthenticated users
  if(!token){
    const protectedPagesMiddlewareRes = protectedPagesMiddleware({path, request});
    if(protectedPagesMiddlewareRes){
      return protectedPagesMiddlewareRes
    }
  } else {
    const cv_provided = await checkCvProvided({path, token, request});

    if(cv_provided){
      return cv_provided
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

  return createMiddleware(routing)(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/trpc`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: '/((?!trpc|_next|_vercel|.*\\..*).*)'
};