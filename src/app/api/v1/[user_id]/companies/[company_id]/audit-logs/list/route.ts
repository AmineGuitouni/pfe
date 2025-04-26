import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params : { company_id } }: { params: { company_id: string } }) {

  if(!company_id) {
        return NextResponse.json({ data: [], count: 0, error: "User ID or Company ID is missing" });
  }

  const supabase = await getServerDBfromCompanyId(company_id)
      if(!supabase){
        return NextResponse.json(
          { error: 'Failed to connect to database' },
          { status: 500 }
        )
      }

  const { searchParams } = new URL(req.url);

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const date = searchParams.get("date") || "";
  const sort = searchParams.get("sort") || "ascending";

  let query = supabase
    .from("audit_logs")
    .select("id, action, timestamp,old_data,new_data,table_name", { count: "exact" })
    .eq("company_id", company_id)
    .order("timestamp", { ascending: sort === "ascending" })

  if (search) {
    query = query.ilike("action", `%${search}%`);
  }

  if (date) {
    const startDate = `${date}T00:00:00`;
    const endDate = new Date(new Date(date).getTime() + 86400000)
      .toISOString()
      .split("T")[0] + "T00:00:00";
    query = query.gte("timestamp", startDate).lt("timestamp", endDate);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return NextResponse.json({ data: [], count: 0, error: error.message });
  }

  return NextResponse.json({ data, count });
}