import { Group } from '@/components/dashboard/groups/types/groupsTypes'
import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase'
import { NextResponse } from 'next/server'

interface params {
  user_id: string
  company_id: string
}

export interface GroupsRouteResponseBody {
  error?: string
  data?: Group[]
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
      .select('id, name, created_at, description, members:user_groups(user_id), permissions, company_id')
      .eq('company_id', company_id)
      .order('created_at', { ascending: true })

    console.log({groups})

    if (error) throw error;

    return NextResponse.json({
      data:groups.map(group => ({
        id: group.id,
        name: group.name,
        description: group.description,
        permissions: group.permissions,
        members_count: group.members.length,
        members: group.members.map(member => member.user_id),
        created_at: group.created_at
      })) satisfies Group[],
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