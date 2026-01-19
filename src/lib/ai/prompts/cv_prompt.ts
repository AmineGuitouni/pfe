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

export const projectTasksPrompt = (projectName: string, projectDescription: string) =>{
return `
You are an expert project manager. Your task is to generate a comprehensive list of tasks based on a project name and description.

Project Name: ${projectName}
Project Description: ${projectDescription}

Please analyze this project and generate a list of tasks.
For each task, provide a title, a detailed description, a list of dependencies (titles of previous tasks), and a difficulty level (1-5).
Ensure the output matches the requested JSON schema.
`
}

export const assignUsersToTasksPrompt = (cvData: string, projectTasks: string) => {
return `
You are an expert project manager and talent matcher. Your task is to assign users to project tasks based on their CV information and the task requirements.

CV Data:
${cvData}

Project Tasks:
${projectTasks}

Please analyze the CV data and project tasks, then assign the best matching users to each task based on:
1. Skill match (both technical and soft skills)
2. Experience level
3. Task difficulty level
4. Availability (if information is provided)
5. Any other relevant factors from the CV

For each task, provide:
1. The best matching user
2. A confidence score (1-100) indicating how well they match
3. Reasons for the assignment (specific skills/experience that match)
4. Any potential concerns or gaps
5. Only one user per task
6. Make sure to well distribute tasks among users in an efficient way
7. Make sure the ids are correct

Return your assignments in a structured JSON format following this structure:
{
  "assignments": [
    {
      "taskId": "",
      "taskTitle": "",
      "assignedUsers": {
        "userId": "",
        "userEmail": "",
        "confidenceScore": 0,
        "matchingSkills": [""],
        "matchingExperience": [""],
        "potentialConcerns": [""]
      }
    }
  ],
  "unassignedUsers": [
    {
      "userId": "",
      "reason": ""
    }
  ]
}

Be thorough in your analysis and provide clear justifications for each assignment. If no suitable match is found for a task or user, include them in the appropriate unassigned section with reasons.
`
}