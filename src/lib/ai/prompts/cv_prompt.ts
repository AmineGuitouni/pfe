export const prompt = (cvText: string) =>{
return `
You are an expert CV analyzer and talent matcher. Your task is to extract structured data from the following CV and identify which task types would be suitable for this candidate.

CV TEXT:
${cvText}

Please analyze this CV and extract the following information in a structured format:

1. Basic information (name, contact details)
2. Professional summary
3. Skills with proficiency levels and years of experience
4. Work experience details including company, role, duration, responsibilities, and technologies used
5. Education details including degrees, institutions, years, and relevant courses
6. Languages and proficiency levels
7. Certifications
8. Projects (if any) with descriptions and technologies used
9. Key strengths based on the CV
10. Recommended task types that match this candidate's skills and experience

Provide your analysis in a structured JSON format following this structure:
{
  "name": "",
  "contact": {
    "email": "",
    "phone": "",
    "linkedin": ""
  },
  "summary": "",
  "skills": [
    {
      "name": "",
      "level": "", // "Beginner" | "Intermediate" | "Advanced" | "Expert"
      "yearsOfExperience": 0
    }
  ],
  "workExperience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "responsibilities": [""],
      "technologies": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "year": "",
      "relevantCourses": [""]
    }
  ],
  "languages": [""],
  "certifications": [""],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": [""],
      "link": ""
    }
  ],
  "strengths": [""],
  "recommendedTaskTypes": [""]
}

Be comprehensive in your analysis and make sure to recommend task types that truly match the candidate's skills and experience. For the recommended task types, consider categories like software development, data analysis, project management, design, content creation, etc., and be specific about the domains where they would excel.
`
}