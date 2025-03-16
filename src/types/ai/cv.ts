interface Skill {
    name: string;
    level: string; // "Beginner" | "Intermediate" | "Advanced" | "Expert"
    yearsOfExperience: number;
  }
  
  interface WorkExperience {
    company: string;
    role: string;
    duration: string;
    responsibilities: string[];
    technologies: string[];
  }
  
  interface Education {
    degree: string;
    institution: string;
    year: string;
    relevantCourses?: string[];
  }
  
export interface CVData {
    name: string;
    contact: {
      email: string;
      phone?: string;
      linkedin?: string;
    };
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
  