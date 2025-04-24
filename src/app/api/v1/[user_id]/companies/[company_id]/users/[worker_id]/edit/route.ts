import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextRequest, NextResponse } from "next/server";

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