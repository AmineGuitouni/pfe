import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params: {company_id}}: {params: { company_id: string}}) {

  const { searchParams } = new URL(req.url);

  const ids = searchParams.get("ids") ? JSON.parse(searchParams.get("ids")!) : undefined;
  
  if(ids){
    try{
      const client = await getServerDBfromCompanyId(company_id);
    
      if (!client) {
        return NextResponse.json({ data: [], error: "Failed to connect to database" });
      }
  
      const query = client
        .from("users")
        .select("id,first_name,last_name,phone_number,country,email,created_at")
        .in("id", ids)
  
      const { data, error } = await query;
  
      if (error) {
        console.error(error);
        return NextResponse.json({ data: [], error: error.message });
      }
  
      console.log(data);
      return NextResponse.json({ data });
    }
    catch(e){
      console.error(e);
      return NextResponse.json({ data: [], error: e instanceof Error ? e.message : "An unexpected error occurred" });
    }
  }

  const page = Number(searchParams.get("page") || "1");
  const limit = Number(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "ascending";
  const excludedUsers = searchParams.get("excludedUsers") ? JSON.parse(searchParams.get("excludedUsers")!) : [];
  const selectedGroups = searchParams.get("groups") ? JSON.parse(searchParams.get("groups")!) : [];

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: [], count: 0, error: "Failed to connect to database" });
  }

  let query = client
    .from("users")
    .select("id,first_name,last_name,phone_number,country,email,created_at,user_groups(groups(name))", { count: "exact" })
    .eq("company_id", company_id)
    .not("id", "in", `(${excludedUsers.join(",")})`)
    .order("created_at", { ascending: sort === "ascending" });

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  if(selectedGroups.length > 0) {
    query = query
    .in("user_groups.groups.name", selectedGroups);
  }


  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query as any;


  if (error) {
    console.error(error);
    return NextResponse.json({ data: [], count: 0, error: error.message });
  }

  const formattedData = data.map((user : any) => ({
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    phone_number: user.phone_number,
    country: user.country,
    email: user.email,
    created_at: user.created_at,
    group: user.user_groups.map((group : any) => group.groups.name).join(", "),
  }));


  return NextResponse.json({ data : formattedData , count });
}