import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string
}

export interface CreateSessionResponse {
    data?:{
        session_id: string;
    },
    error?: string
}

export interface CreateSessionRequest {
    name: string;
    mode: string;
}

export async function POST(req: Request, {params}:{params:Params}) {
    try {
        const { user_id, company_id } = params;
        const supabase = await getServerDBfromCompanyId(company_id);

        if (!supabase) {
            return NextResponse.json({ error: 'Invalid company ID' }, { status: 400 });
        }

        const {name, mode} = await req.json() as CreateSessionRequest;

        if (!name || !mode) {
            console.log({name, mode})
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const {data, error} = await supabase
            .from('command_center_sessions')
            .insert({
                name,
                user_id: user_id,
                company_id: company_id,
                mode
            })
            .select("id")
            .single();

        if (error) {
            console.error('Error creating session:', error);
            return NextResponse.json({ error: "Database Error" }, { status: 500 });
        }

        if (!data) {
            return NextResponse.json({ error: "Session creation failed" }, { status: 500 });
        }

        return NextResponse.json({
            data: {
                session_id: data.id
            }
        }, { status: 201 });
    }
    catch (error) {
        console.error('Error creating session:', error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}