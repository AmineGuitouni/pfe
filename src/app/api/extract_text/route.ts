// app/api/extract-pdf-text/route.ts (for Next.js App Router)
import {  NextResponse } from 'next/server';
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export async function POST(req: Request) {
  try {
    // Check if request contains a file
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Create a blob from the file
    const blob = new Blob([fileBuffer], { type: file.type });
    const loader = new WebPDFLoader(blob);
    
    const docs = await loader.load();
    const fullText = docs.map(doc => doc.pageContent).join('\n\n');
    
    return NextResponse.json({ text: fullText.trim() });
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    return NextResponse.json(
      { error: `Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}