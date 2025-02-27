import { NextResponse } from 'next/server';
import { supabase } from '@/lib/database/supabase';

interface Params {
  user_id: string;
  database_id: string;
}

export async function DELETE(request: Request, { params }: { params: Params }) {
  const { user_id, database_id } = params;

  try {
    const { error } = await supabase
      .from('data_bases')
      .delete()
      .eq('id', database_id)
      .eq('user_id', user_id)

    if (error) {
      console.error(error);
      return NextResponse.json({ error: 'Failed to delete database' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Database deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
