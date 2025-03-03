import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params: {company_id}}: {params: { company_id: string}}) {

  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "ascending";

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: [], count: 0, error: "Failed to connect to database" });
  }


  let query = client
    .from("users")
    .select("id,first_name,last_name,phone_number,country,email,created_at", { count: "exact" })
    .eq("company_id", company_id)
    .order("created_at", { ascending: sort === "ascending" })

  if (search) {
    query = query.ilike("action", `%${search}%`);
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