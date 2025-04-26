import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, {params: {company_id,user_id}}: {params: { company_id: string,user_id:string}}) {

  const { searchParams } = new URL(req.url);

  const ids = searchParams.get("ids") ? JSON.parse(searchParams.get("ids")!) : undefined;
  
  if(ids){
    try{
      const client = await getServerDBfromCompanyId(company_id,user_id);
    
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

  const client = await getServerDBfromCompanyId(company_id);
  
  if (!client) {
    return NextResponse.json({ data: [], count: 0, error: "Failed to connect to database" });
  }

  let query = client
    .from("users")
    .select("id,first_name,last_name,phone_number,country,email,created_at", { count: "exact" })
    .eq("company_id", company_id)
    .not("id", "in", `(${excludedUsers.join(",")})`)
    .order("created_at", { ascending: sort === "ascending" })

    if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
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

export async function DELETE(req: NextRequest, {params: {company_id,user_id}}: {params: { company_id: string, user_id: string}}) {
    const client = await getServerDBfromCompanyId(company_id,user_id);
  
    if (!client) {
        return NextResponse.json({ data: [], count: 0, error: "Failed to connect to database" });
    }   

    const {error} = await client.from("users")
    .delete()
    .eq("id", user_id)
    .eq("company_id", company_id)

    if(error) {
        console.error(error);
        return NextResponse.json({error: error.message });
    }

    return NextResponse.json({  ok: true });

}

export async function PUT(
  req: NextRequest, 
  {params: {company_id,user_id}}: {params: { company_id: string,user_id:string}}
) {
  try {
    const client = await getServerDBfromCompanyId(company_id,user_id);

    if (!client) {
      return NextResponse.json({ 
        error: "Failed to connect to database" 
      }, { status: 500 });
    }   

    const { user } = await req.json();

    console.log(user);

    // Validate input
    if (!user) {
      return NextResponse.json({ 
        error: "User data is required" 
      }, { status: 400 });
    }

    // Perform update
    const { error } = await client
      .from('users')
      .update({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        country: user.country,
        phone_number: user.phone_number
      })
      .eq('id', user.id);

    if (error) {
      console.error('Update error:', error);
      return NextResponse.json({ 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true,
      message: 'User updated successfully' 
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}