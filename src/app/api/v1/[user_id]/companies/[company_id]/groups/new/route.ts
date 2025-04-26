import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase'
import { redis } from '@/lib/database/redis'
import { NextResponse } from 'next/server'

interface params {
  user_id: string
  company_id: string
}

export interface CreateGroupRequestBody {
  name: string
  description?: string
  permissions: string[]
  users: string[]
}

export interface CreateGroupResponseBody {
  error?: string
  data?: {id: string}
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

    if (error) throw error;

    if (!group) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    const { error: error2 } = await supabase
      .from('user_groups')
      .insert(body.users.map((user_id) => ({
        user_id: user_id,
        group_id: group.id
      })))

    if (error2) throw error2

    for(const user of body.users){
      redis.del(`user:${user}-permissions:${company_id}`)
    }

    return NextResponse.json({ data: group })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    )
  }
}