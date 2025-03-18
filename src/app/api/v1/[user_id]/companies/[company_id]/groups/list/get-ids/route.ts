export const fetchCache = "force-no-store"

import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase'
import { NextResponse } from 'next/server'

interface params {
  user_id: string
  company_id: string
}


export async function GET(request: Request, { params }: { params: params }) {

  const { company_id } = params

  if (!company_id) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    )
  }

  try {
    const supabase = await getServerDBfromCompanyId(company_id)
    if(!supabase){
      return NextResponse.json(
        { error: 'Failed to connect to database' },
        { status: 500 }
      )
    }

    const { data: groups, error } = await supabase
      .from('groups')
      .select('id, name')
      .eq('company_id', company_id)
      .order('created_at', { ascending: true })


    if (error) throw error;

    return NextResponse.json({
      data:groups
    })
  } 
  catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}