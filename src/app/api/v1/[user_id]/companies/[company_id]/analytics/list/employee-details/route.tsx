import { NextResponse } from 'next/server';
import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase';


export async function GET(
    request: Request,
    { params }: { params: { user_id: string; company_id: string } }
) {
    const { company_id, user_id } = params;
    const { searchParams } = new URL(request.url);
    const day = searchParams.get('day');
    const month = searchParams.get('month');
    const year = searchParams.get('year');
    const workers : string[] | null = searchParams.get('worker_id') ?
    JSON.parse(searchParams.get('worker_id')!) : null;

    if(!month || !year){
        return NextResponse.json({ error: 'Month and year are required' }, { status: 400 });
    }

    if (!company_id) {
        return NextResponse.json({ error: 'Company ID is required' }, { status: 400 });
    }

    const supabase = await getServerDBfromCompanyId(company_id, user_id);
    
    if (!supabase) {
        return NextResponse.json({ error: 'Failed to connect to company database. Company or configuration may not exist.' }, { status: 404 });
    }

    try{

        const query = supabase
        .from('project_task_history')
        .select("task_id, updated_at,status")
        .order("updated_at", { ascending: true })

        if(workers){
            query.in("project_user_tasks.user_id", workers)
        }

        if(day){
            query.gte("updated_at", `${year}-${month}-${day}T00:00:00.000Z`)
            query.lte("updated_at", `${year}-${month}-${day}T23:59:59.999Z`)
        }
        else{
            query.gte("updated_at", `${year}-${month}-01T00:00:00.000Z`)
            const y = Number(year) + Math.floor((Number(month) - 1) / 12)
            const m = (Number(month) - 1) % 12 + 1
            query.lte("updated_at", `${y}-${m}-31T23:59:59.999Z`)
        }

        const {data,error} = await query

        if(error){
            console.log(error)
            return NextResponse.json({error:"Internal Server Error"}, {status: 500})
        }

        if(!data){
            return NextResponse.json({data:[]}, {status: 200})
        }


        const divisions : any[] = []

        if(day){
            let start = new Date(`2025-01-01T01:00:00.000Z`);
            let d : any[] = []
            data.forEach((h) => {
                const taskDate = new Date(h.updated_at);
                if(taskDate.valueOf() < start.valueOf()){
                    d.push(h)
                }
                else{
                    divisions.push(d)
                    d = [h]
                    start = new Date(start.valueOf() + 3600000)
                }
            })
            if(d.length > 0){
                divisions.push(d)
            }
        }
        else{
            let start = new Date(`${year}-${month}-01T00:00:00Z`);
            let d : any[] = []
            data.forEach((h) => {
                const taskDate = new Date(h.updated_at);
                if(taskDate < start){
                    d.push(h)
                }
                else{
                    divisions.push(d)
                    d = [h]
                    start = new Date(start.valueOf() + 3600000 * 24)
                }
            })
        }

        

        return NextResponse.json({data:divisions}, {status: 200})






    }
    catch(error){
        console.log(error)
        return NextResponse.json({error:"Internal Server Error"}, {status: 500})
    }
    
       
}