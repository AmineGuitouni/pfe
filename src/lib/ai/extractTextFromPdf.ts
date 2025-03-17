// lib/ai/extractTextFromPdf.ts
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const originUrl = window.location.origin;
    
    const response = await fetch(originUrl + '/api/extract_text', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to extract text from PDF');
    }
    
    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}