import { Group } from '@/components/dashboard/groups/types/groupsTypes'
import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase'
import { NextResponse } from 'next/server'

interface params {
  user_id: string
  company_id: string
}

export interface CreateGroupRequestBody {
  name: string
  description?: string
  permissions: string[]
}

export interface CreateGroupResponseBody {
  error?: string
  data?: Group
}

export async function POST(request: Request, { params }: { params: params }) {
  const { company_id } = params

  if (!company_id) {
    return NextResponse.json(
      { error: 'Company ID is required' },
      { status: 400 }
    )
  }

  try {
    const body: CreateGroupRequestBody = await request.json()
    
    if (!body.name || !body.permissions) {
      return NextResponse.json(
        { error: 'Name and permissions are required' },
        { status: 400 }
      )
    }

    const supabase = await getServerDBfromCompanyId(company_id)
    if (!supabase) {
      return NextResponse.json(
        { error: 'Failed to connect to database' },
        { status: 500 }
      )
    }

    const { data: group, error } = await supabase
      .from('groups')
      .insert({
        name: body.name,
        description: body.description,
        permissions: body.permissions,
        company_id: company_id
      })
      .select('id')
      .single()

    if (error) throw error

    return NextResponse.json({ data: group.id })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}