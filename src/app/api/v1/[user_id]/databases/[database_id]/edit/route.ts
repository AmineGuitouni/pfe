import { NextResponse } from 'next/server';
import { authedSupabase } from '@/lib/database/supabase';

interface Params {
  user_id: string;
  database_id: string;
}

export async function PUT(request: Request, { params }: { params: Params }) {
  const { user_id, database_id } = params;

  try {
    const body = await request.json();
    const { name, connection_config } = body;

    if (!name || !connection_config) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await authedSupabase(user_id)
      .from('data_bases')
      .update({
        name,
        connection_config,
      })
      .eq('id', database_id)
      .eq('user_id', user_id)

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to update database' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Database updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
