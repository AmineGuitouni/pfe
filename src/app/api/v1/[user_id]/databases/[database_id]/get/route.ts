import { supabase } from "@/lib/database/supabase";
import { NextResponse } from "next/server";
import { Database } from "../../list/route";

interface Params {
    user_id: string;
    database_id: string;
}

export interface GetDatabaseResponse {
    data?: Database,
    error?: string
}
  
export async function GET(request: Request, { params }: { params: Params }) {
    const { user_id, database_id } = params;
  
    try {
      const { data, error } = await supabase
        .from('data_bases')
        .select('*')
        .eq('id', database_id)
        .eq('user_id', user_id)
        .single();
  
      if (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to get database: ' + error.message + '' }, { status: 500 });
      }
  
      return NextResponse.json({data});
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}