import { NextResponse } from "next/server";

interface params {
    user_id: string;
    company_id: string
}

export async function POST(request: Request, { params }: { params: params }) {
    return NextResponse.json({});
}