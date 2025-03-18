  export interface Skill {
    name: string;
    level: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"
    yearsOfExperience: number;
  }
  
  export interface WorkExperience {
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
    technologies: string[];
  }
  
  export interface Education {
    degree: string;
    institution: string;
    year: string;
    relevantCourses?: string[];
  }
  
export interface CVData {
    id : string;
    user_id : string;
    summary: string;
    skills: Skill[];
    workExperience: WorkExperience[];
    education: Education[];
    languages?: string[];
    certifications?: string[];
    projects?: {
      name: string;
      description: string;
      technologies: string[];
      link?: string;
    }[];
    strengths: string[];
    recommendedTaskTypes: string[];
  }
  