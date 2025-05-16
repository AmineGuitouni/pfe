import { Message } from "@/components/dashboard/command-center/hooks/useCommandCenter";
import { getPrompt } from "@/lib/ai/agent/prompt";
import { agentClient, agentModelName } from "@/lib/ai/openai";
import { getServerDBfromCompanyId } from "@/lib/database/externalServerSupabase";
import { NextResponse } from "next/server";
import { ChatCompletionChunk, ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Stream } from "openai/streaming.mjs";

interface Params {
    user_id: string
    company_id: string
}

export interface CommandCenterRequestBody {
    query: string,
    history: Message[]
}

export async function POST(req: Request, { params }: { params: Params }) {
    const { company_id } = params;
    const supabase = await getServerDBfromCompanyId(company_id);

    if (!supabase) {
        return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
    }

    try{
        const { query, history }:CommandCenterRequestBody = await req.json();

        const completionStream = await agentClient.chat.completions.create({
            messages: [
                {role:"system", content:getPrompt()},
                ...history.map((message: Message) => ({ role: message.sender === 'ai' ? 'assistant' : 'user', content: message.text })),
                { role: 'user', content: query}
            ] as ChatCompletionMessageParam[],
            model: agentModelName,
            temperature: 0,
            stream: true
        });

        return new Response(iteratorToStream(streamToGenerator(completionStream)));
    }
    catch(e){
        console.log(e)
    }
    return NextResponse.json({});
}

async function *streamToGenerator(stream: Stream<ChatCompletionChunk>) {
    for await (const chunk of stream) {
      yield chunk.choices[0].delta.content || "";
    }
}

function iteratorToStream(iterator: any) {
    return new ReadableStream({
      async pull(controller) {
        const { value, done } = await iterator.next()
   
        if (done) {
          controller.close()
        } else {
          controller.enqueue(value)
        }
      },
    })
  }