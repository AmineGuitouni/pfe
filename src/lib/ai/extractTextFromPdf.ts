export const extractTextFromPdf = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
  
    const res = await fetch('/api/cv-parcer/extract-text', {
      method: 'POST',
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error('Failed to extract text from PDF');
    }
  
    const data = await res.json();
    return data.text;
  };