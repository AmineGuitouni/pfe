import { JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

interface EmailVerificationMiddlewareOptions{
    path: string,
    token: JWT,
    request: NextRequest
}
export default function checkCvProvided({path, token, request}:EmailVerificationMiddlewareOptions){
    
    if(token.role === "owner" && path === "/provide_cv") {
        return NextResponse.redirect(new URL('/dashboard/account', request.url));
    }
    if(token.role === "worker") {
        const workerCompanyId = token.company_id;
        const cv_informations = token.cv_informations === true

        const isHome = path === "/";
        const provide_cv_path = path === `/provide_cv`;
        const isWorkerCompanyDashboard = path === `/dashboard/${workerCompanyId}` || 
                                        path.startsWith(`/dashboard/${workerCompanyId}/`);

        if(!isHome && !provide_cv_path && !isWorkerCompanyDashboard){
            if(!cv_informations){
                return NextResponse.redirect(new URL('/provide_cv', request.url));
            }
            else{
                return NextResponse.redirect(new URL(`/dashboard/${workerCompanyId}`, request.url));
            }
        }
        
        if(isWorkerCompanyDashboard && !cv_informations){
            return NextResponse.redirect(new URL('/provide_cv', request.url));
        }

        if(cv_informations && provide_cv_path){
            return NextResponse.redirect(new URL(`/dashboard/${workerCompanyId}`, request.url));
        }
      }
  
}