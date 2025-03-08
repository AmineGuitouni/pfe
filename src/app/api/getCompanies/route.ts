import { supabase } from '@/lib/database/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    
    let query = supabase
      .from('company')
      .select('id, name');

    if (filter && filter.trim() !== '') {
      query = query.ilike('name', `%${filter}%`);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch companies', data: [] },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data: data });
  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred', data: [] },
      { status: 500 }
    );
  }
}