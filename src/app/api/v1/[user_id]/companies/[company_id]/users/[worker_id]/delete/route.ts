import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest, {params: {company_id,worker_id,user_id}}: {params: { company_id: string, worker_id: string,user_id:string}}) {
    const client = await getServerDBfromCompanyId(company_id,user_id);
  
    if (!client) {
        return NextResponse.json({ data: [], count: 0, error: "Failed to connect to database" });
    }   

    const {error} = await client.from("users")
    .delete()
    .eq("id", worker_id)
    .eq("company_id", company_id)

    if(error) {
        console.error(error);
        return NextResponse.json({error: error.message });
    }

    return NextResponse.json({  ok: true });

}
