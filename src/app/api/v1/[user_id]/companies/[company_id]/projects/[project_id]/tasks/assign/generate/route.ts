export const fetchCache = "force-no-store"

import { AssignmentData } from "@/components/dashboard/projects/types";
import { openai } from "@/lib/ai/openai";
import { assignUsersToTasksPrompt } from "@/lib/ai/prompts/cv_prompt";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string;
    project_id: string;
}

export interface assignUsersToTasksResponse {
    data?: AssignmentData | null;
    error?: string;
}

export async function GET(req: Request, {params: {company_id, project_id}}: {params: params}){
    try{
        const supabase = await getServerDBfromCompanyId(company_id);
        if (!supabase) {
            return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
        }

        const {data: availbleUsers, error: usersError} = await supabase.from("cv_informations")
        .select("summary,workExperience,strengths,skills,projects,languages,certifications,recommendedTaskTypes,users!users_cv_informations_fkey!inner(id,email)")
        .eq("users.company_id", company_id)

        if(usersError){
            console.log(usersError);
            return NextResponse.json({error: "Failed to get users"}, {status: 500})
        }

        const {data: prjectInfo, error: projectError} = await supabase.from("projects")
        .select("name, description, tasks:project_tasks(id, description, title, difficulty_level)")
        .eq("id", project_id)
        .eq("company_id", company_id)

        if(projectError){
            console.log(projectError);
            return NextResponse.json({error: "Failed to get project info"}, {status: 500})
        }

        const response = await openai.chat.completions.create({
            model: "gemini-2.0-flash",
            messages:[
                {
                    role: "user",
                    content: [
                        {
                            type:"text",
                            text: assignUsersToTasksPrompt(JSON.stringify(availbleUsers), JSON.stringify(prjectInfo))
                        }
                    ]
                }
            ]
        })

        return NextResponse.json({
            data:response.choices[0].message.content ? JSON.parse(
                response.choices[0].message.content.replace("```json", '').replace("```", '')
            ) : null,
        })
    }
    catch(error){
        console.log(error);
        return NextResponse.json({error: "Something went wrong"}, {status: 500})
    }
}