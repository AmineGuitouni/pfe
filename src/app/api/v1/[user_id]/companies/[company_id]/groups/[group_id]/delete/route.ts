import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { redis } from "@/lib/database/redis";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    group_id: string;
}

export async function DELETE(reqest: Request, { params }: { params: Params }) {
    try{
        const {company_id, group_id} = params;
        console.log({ company_id, group_id });

        const supabase = await getServerDBfromCompanyId(company_id);
        if(!supabase){
            return NextResponse.json({error: "Failed to connect to database"}, {status: 500})
        }

        const { data, error } = await supabase
        .from("groups")
        .delete()
        .eq("id", group_id)
        .eq("company_id", company_id)
        .select("user_groups(user_id)")
        .single()

        if(error){
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500})
        }

        for(const user of data.user_groups){
            redis.del(`user:${user.user_id}-permissions:${company_id}`)
        }

        return NextResponse.json({message: "Group updated successfully"}, {status: 200})
    }
    catch(err){
        console.log(err);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}