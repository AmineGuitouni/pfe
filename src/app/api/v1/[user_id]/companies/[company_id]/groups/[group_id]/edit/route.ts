import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { redis } from "@/lib/database/redis";
import { NextResponse } from "next/server";

interface Params {
    user_id: string;
    company_id: string;
    group_id: string;
}

export type EditGroupRequestBody  = {
    name: string;
    description: string;
    permissions: string[];
    newUsers: string[];
    removedUsers: string[];
}

export async function PUT(reqest: Request, { params }: { params: Params }) {
    try{
        const body: EditGroupRequestBody = await reqest.json();
        const {company_id, group_id ,user_id} = params;

        const supabase = await getServerDBfromCompanyId(company_id , user_id);
        if(!supabase){
            return NextResponse.json({error: "Failed to connect to database"}, {status: 500})
        }

        console.log(body);

        const { error } = await supabase
        .from("groups")
        .update({
            name: body.name,
            description: body.description,
            permissions: body.permissions,
        })
        .eq("id", group_id)

        if(error){
            console.log(error);
            return NextResponse.json({error: error.message}, {status: 500})
        }

        const { error: newUsersError } = await supabase
        .from("user_groups")
        .upsert(body.newUsers.map((user) => ({
            user_id: user,
            group_id: group_id
        })))

        if(newUsersError){
            console.log(newUsersError);
            return NextResponse.json({error: newUsersError.message}, {status: 500})
        }

        const { error: removedUsersError } = await supabase
        .from("user_groups")
        .delete()
        .eq("group_id", group_id)
        .in("user_id", body.removedUsers)

        if(removedUsersError){
            console.log(removedUsersError);
            return NextResponse.json({error: removedUsersError.message}, {status: 500})
        }

        const { data: users, error: selectError } = await supabase
        .from("user_groups")
        .select("user_id")
        .eq("group_id", group_id)

        if(selectError){
            console.log(selectError);
            return NextResponse.json({error: selectError.message}, {status: 500})
        }

        for(const user of users){
            redis.del(`user:${user.user_id}-permissions:${company_id}`)
        }

        return NextResponse.json({message: "Group updated successfully"}, {status: 200})
    }
    catch(err){
        console.log(err);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}
