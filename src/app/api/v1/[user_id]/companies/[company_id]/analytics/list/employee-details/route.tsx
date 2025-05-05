import { NextResponse } from 'next/server';
import { getServerDBfromCompanyId } from '@/lib/database/externalServerSupabase';

const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard', 'Very Hard', 'Extreme'];
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
        .select("task_id, updated_at,status, project_tasks!inner(project_user_tasks!inner(user_id), difficulty_level)", {count: 'exact'})
        .order("updated_at", { ascending: true })
        .limit(1000)

        if(workers){
            query.in("project_tasks.project_user_tasks.user_id", workers)
        }

        if(day && day !== "null" && day !== "undefined"){
            // query.gte("updated_at", `${year}-${month}-${day}T00:00:00.000Z`)
            query.lte("updated_at", `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T23:59:59.999Z`)
        }
        else{
            // query.gte("updated_at", `${year}-${month}-01T00:00:00.000Z`)
            const y = Number(year) + Math.floor(Number(month) / 12)
            const m = Number(month) % 12 + 1
            query.lt("updated_at", `${y}-${m.toString().padStart(2, '0')}-01T00:00:00.000Z`)
        }

        const {data: pageData,error, count} = await query

        if(error){
            console.log(error)
            return NextResponse.json({error:"Internal Server Error"}, {status: 500})
        }

        if(!pageData){
            return NextResponse.json({data:[]}, {status: 200})
        }

        const allfetchedData = [...pageData]

        if(count && count > 1000){
            const pages = Math.ceil(count / 1000)
            for(let i = 2; i <= pages; i++){
                const {data: nextPageData, error:errorPage} = await query.range((i - 1) * 1000, i * 1000 - 1)
                if(errorPage){
                    console.log(errorPage)
                    return NextResponse.json({error:"Internal Server Error"}, {status: 500})
                }
                
                allfetchedData.push(...nextPageData)
            }
        }

        const data: typeof allfetchedData = [];
        const prevData: typeof allfetchedData = [];
        allfetchedData.forEach((h) => {
            const hDate = new Date(h.updated_at);
            if(day && day !== "null" && day !== "undefined"){
                const gteDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T00:00:00.000Z`)
                
                if(hDate <= gteDate){
                    prevData.push(h);
                }
                else{
                    data.push(h);
                }
            }
            else{
                const gteDate = new Date(`${year}-${month.padStart(2, '0')}-01T00:00:00.000Z`)
                if(hDate <= gteDate){
                    prevData.push(h);
                }
                else{
                    data.push(h);
                }
            }
        })

        // 9asemt el data lel divisionat day/month
        const divisions = day && day !== "null" && day !== "undefined"
            ? groupTasksByHour(data)
            : groupTasksByDayInMonth(data, Number(month!), Number(year!));

        // bes nraka7 kol devision
        const cleanedDivisions = divisions.map((division, index) => {
            const cleanedDiv = [] as typeof division;
            const prevDivision = [...prevData, ...divisions.slice(0, index + 1).flat()];
            const tasksSet = new Set();
            prevDivision.reverse().forEach((h) => {
                if(!tasksSet.has(h.task_id)){
                    tasksSet.add(h.task_id);
                    cleanedDiv.push(h);
                }
            })

            return cleanedDiv;
        })

        // Determine if we are grouping by hour or day
        const isHourlyGrouping = day && day !== "null" && day !== "undefined";

        // Transform the data to the chart data type, including the label
        const chartData = cleanedDivisions.map((division, index) => {
            const statuses = {} as Record<string, number | string>; // Allow string/number for label and number for counts
            const diffs = {} as Record<string, number>;

            // Add the hour or day label
            if (isHourlyGrouping) {
                statuses["hour"] = `${index.toString().padStart(2, '0')}:00`;
            } else {
                statuses["day"] = index + 1; // Day number (1-based)
            }

            division.forEach((h) => {
                // Ensure status is treated as number for incrementing
                statuses[h.status] = (statuses[h.status] as number || 0) + 1;
                const task = h.project_tasks as any;
                diffs[DIFFICULTY_LEVELS[task.difficulty_level]] = (diffs[DIFFICULTY_LEVELS[task.difficulty_level]] || 0) + 1;
            });

            // Ensure all standard statuses exist, even if count is 0, and maintain label type
            const finalStatuses = {
                [isHourlyGrouping ? "hour" : "day"]: statuses[isHourlyGrouping ? "hour" : "day"],
                "To Do": statuses["To Do"] ?? 0,
                "In Progress": statuses["In Progress"] ?? 0,
                "Completed": statuses["Completed"] ?? 0,
                "Blocked": statuses["Blocked"] ?? 0,
                ...diffs
            };

            return finalStatuses;
        });

        return NextResponse.json({data:{
            chartData
        }}, {status: 200})
    }
    catch(error){
        console.log(error instanceof Error ? error.message : "Internal Server Error")
        return NextResponse.json({error:error instanceof Error ? error.message : "Internal Server Error"}, {status: 500})
    }
}

function groupTasksByHour<T extends { updated_at: string }>(tasks: T[]) {
  const hours = Array.from({ length: 24 }, (_, i) => 
    `${i.toString().padStart(2, '0')}:00`);

  const grouped = hours.reduce((acc, hour) => {
    acc[hour] = [];
    return acc;
  }, {} as Record<string, T[]>);

  for (const task of tasks) {
    const date = new Date(task.updated_at);
    const utcHour = date.getUTCHours();
    const hourKey = hours[utcHour];
    grouped[hourKey].push(task);
  }

  return hours.map(hour => grouped[hour]);
}

function groupTasksByDayInMonth<T extends { updated_at: string }>(
    tasks: T[],
    targetMonth: number,
    targetYear: number
) {
    const daysInMonth = new Date(targetYear, targetMonth, 0).getUTCDate();

    const groupedData: Record<string, T[]> = {};
    const result: T[][] = [];
    const monthString = targetMonth.toString().padStart(2, '0');

    for (let i = 1; i <= daysInMonth; i++) {
        const dayString = i.toString().padStart(2, '0');
        const fullDateString = `${targetYear}-${monthString}-${dayString}`;
        groupedData[fullDateString] = [];
        result.push(groupedData[fullDateString]);
    }

    for (const task of tasks) {
        const date = new Date(task.updated_at);

        if (
            date.getUTCFullYear() === targetYear &&
            date.getUTCMonth() === targetMonth - 1
        ) {
            const dayOfMonth = date.getUTCDate();
            const dayString = dayOfMonth.toString().padStart(2, '0');
            const fullDateString = `${targetYear}-${monthString}-${dayString}`;

            if (groupedData[fullDateString]) {
                 groupedData[fullDateString].push(task);
            }
        }
    }

    return result;
}
