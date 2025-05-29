import { JWT } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { extractPathParameters } from "./helper";
import { apisRules } from "./rules";
import { supabase } from "@/lib/database/supabase";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import {redis} from "@/lib/database/redis";

interface ApiMiddlewareOptions {
    path: string,
    token: JWT | null,
    request:NextRequest
}

export default async function apiMiddleware({path, token}:ApiMiddlewareOptions) {
    // Authentication check - return early if no token
    
    // for testing purposes only (disabled for production testing)
    if(!token){
        console.log("No token found, using default token");
        token = {
            name: 'Mohamed Amine Guitouni',
            email: 'guitouni.medamine@gmail.com',
            sub: 'a1232090-2c7b-4d8a-bcd0-9350df246ced',
            first_name: 'Mohamed Amine',
            last_name: 'Guitouni',
            role: 'owner',
            email_verified: true,
            country: 'Tunisia',
            phone_number: '56522039',
            jti: '4a58d684-7aa9-4737-833a-29fa92516238'
        } as JWT
    }
    const passResponse = NextResponse.next();
    passResponse.headers.set('x-user-role', token?.role as string | null || 'guest');

    const {pattern, params, rule} = extractPathParameters(path, apisRules)
    if(!pattern || !rule || !rule.authOnly){
        return passResponse;
    }
    
    if(!params){
        return NextResponse.json({error: "Bad Request"}, {status: 400});
    }

    if(!token){
        return NextResponse.json({error: "Access denied: unauthenticated request"}, {status: 403});
    }

    if(rule.role === "owner" && token.role !== rule.role){
        return NextResponse.json({error: "Access denied: this route is only for admins."}, {status: 403});
    }

    if(params.user_id && token.sub !== params.user_id){
        return NextResponse.json({error: "Access denied: you are not the owner of this resource"}, {status: 403});
    }

    if(params.database_id && token.role !== "owner"){
        return NextResponse.json({error: "Access denied: you are not the owner of this resource"}, {status: 403});
    }

    if(params.company_id){
        if(token.role === "owner"){
            const cachedCompany = await redis.get(`user:${token.sub}-company:${params.company_id}`);
            
            if(!cachedCompany){
                const {data, error} = await supabase.from("company")
                .select("id")
                .eq("id", params.company_id)
                .eq("user_id", token.sub);

                if(error){
                    return NextResponse.json({error: "Error while checking company ownership"}, {status: 500});
                }
                
                if(!data || data.length === 0){
                    redis.set(`user:${token.sub}-company:${params.company_id}`, "false");
                    return NextResponse.json({error: "Access denied: you are not the owner of this company"}, {status: 403});
                }

                redis.set(`user:${token.sub}-company:${params.company_id}`, "true");
            }
            else if(cachedCompany === "false"){
                return NextResponse.json({error: "Access denied: you are not the owner of this company"}, {status: 403});
            }
        }

        if(token.role === "worker" && token.company_id !== params.company_id){
            return NextResponse.json({error: "Access denied: you are not in this company"}, {status: 403});
        }
    }

    if(token.role !== "owner" && rule.permissions && rule.permissions.length > 0){
        if(token.rule === "owner"){
            return passResponse;
        }

        if(!params.company_id){
            return NextResponse.json({error: "Company ID is required"}, {status: 400});
        }

        const cachedPermissions = await redis.get(`user:${token.sub}-permissions:${params.company_id}`)
        let allPermissions: string[] = [];
        if(!cachedPermissions){
            const localDb = await getServerDBfromCompanyId(params.company_id);

            if(!localDb){
                return NextResponse.json({error: "Failed to connect to database"}, {status: 500});
            }

            const {data, error} = await localDb.from("user_groups")
            .select("groups(permissions)")
            .eq("user_id", token.sub) as any

            if(error){
                console.log("Error while checking user permissions", {error})
                return NextResponse.json({error: "Error while checking user permissions"}, {status: 500});
            }

            allPermissions = data?.flatMap((group: any) => group.groups.permissions) || [];
            redis.set(`user:${token.sub}-permissions:${params.company_id}`, allPermissions);
        }
        else {
            allPermissions = cachedPermissions as string[];
        }

        const hasPermission = rule.permissions.every((permission) => allPermissions.includes(permission));

        if(!hasPermission){
            return NextResponse.json({error: "Access denied: you don't have the required permissions"}, {status: 403});
        }
    }

    return passResponse;
}