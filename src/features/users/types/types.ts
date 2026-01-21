import { Education, Skill, WorkExperience } from "@/types/ai/cv";

export type User = {
    id: string;
    email: string;
    first_name: string;	
    last_name: string;
    country: string;
    phone_number: string;
    created_at: string;
    group : string
}

export type GroupSelected = {
    id: string;
    name: string;
}

export type UserCvInfo = {
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