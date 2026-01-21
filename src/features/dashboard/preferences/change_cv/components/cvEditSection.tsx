"use client"
import { Button, Input, Textarea, Chip } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CVData, Skill, WorkExperience, Education } from "@/types/ai/cv";
import { MdAdd, MdDelete, MdSave } from "react-icons/md";

interface Project {
    name: string;
    description: string;
    technologies: string[];
    link?: string;
}

export default function CvEditSection() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [cvData, setCvData] = useState<Partial<CVData>>({
        summary: "",
        skills: [],
        workExperience: [],
        education: [],
        languages: [],
        certifications: [],
        projects: [],
        strengths: [],
        recommendedTaskTypes: []
    });

    // Fetch existing CV data
    useEffect(() => {
        const fetchCvData = async () => {
            if (!session?.user?.id || !session?.user?.company_id) return;
            
            setFetchLoading(true);
            try {
                const response = await fetch(
                    `/api/v1/${session.user.id}/companies/${session.user.company_id}/users/list/get_cv_info?id=${session.user.id}`
                );
                const result = await response.json();
                
                if (response.ok && result.data) {
                    setCvData({
                        summary: result.data.summary || "",
                        skills: result.data.skills || [],
                        workExperience: result.data.workExperience || [],
                        education: result.data.education || [],
                        languages: result.data.languages || [],
                        certifications: result.data.certifications || [],
                        projects: result.data.projects || [],
                        strengths: result.data.strengths || [],
                        recommendedTaskTypes: result.data.recommendedTaskTypes || []
                    });
                }
            } catch (error) {
                console.error("Error fetching CV data:", error);
                toast.error("Failed to load CV data");
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCvData();
    }, [session?.user.company_id, session?.user.id]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id || !session?.user?.company_id) {
            toast.error("Authentication required");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `/api/v1/${session.user.id}/companies/${session.user.company_id}/users/list/update_cv_info?id=${session.user.id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ cvData }),
                }
            );

            const result = await response.json();
            if (response.ok) {
                toast.success("CV information updated successfully");
            } else {
                throw new Error(result.error || "Failed to update CV");
            }
        } catch (error) {
            console.error("Error updating CV:", error);
            toast.error("Failed to update CV information");
        } finally {
            setLoading(false);
        }
    };

    // Helper functions for array fields
    const addStringToArray = (field: keyof CVData, value: string) => {
        if (!value.trim()) return;
        setCvData(prev => ({
            ...prev,
            [field]: [...(prev[field] as string[] || []), value.trim()]
        }));
    };

    const removeFromArray = (field: keyof CVData, index: number) => {
        setCvData(prev => ({
            ...prev,
            [field]: (prev[field] as any[])?.filter((_, i) => i !== index) || []
        }));
    };

    // Skills management
    const addSkill = () => {
        setCvData(prev => ({
            ...prev,
            skills: [...(prev.skills || []), { name: "", level: "Beginner", yearsOfExperience: 0 }]
        }));
    };

    const updateSkill = (index: number, field: keyof Skill, value: any) => {
        setCvData(prev => ({
            ...prev,
            skills: prev.skills?.map((skill, i) => 
                i === index ? { ...skill, [field]: value } : skill
            ) || []
        }));
    };

    // Work Experience management
    const addWorkExperience = () => {
        setCvData(prev => ({
            ...prev,
            workExperience: [...(prev.workExperience || []), {
                company: "",
                role: "",
                duration: "",
                responsibilities: [],
                technologies: []
            }]
        }));
    };

    const updateWorkExperience = (index: number, field: keyof WorkExperience, value: any) => {
        setCvData(prev => ({
            ...prev,
            workExperience: prev.workExperience?.map((exp, i) => 
                i === index ? { ...exp, [field]: value } : exp
            ) || []
        }));
    };

    // Education management
    const addEducation = () => {
        setCvData(prev => ({
            ...prev,
            education: [...(prev.education || []), {
                degree: "",
                institution: "",
                year: "",
                relevantCourses: []
            }]
        }));
    };

    const updateEducation = (index: number, field: keyof Education, value: any) => {
        setCvData(prev => ({
            ...prev,
            education: prev.education?.map((edu, i) => 
                i === index ? { ...edu, [field]: value } : edu
            ) || []
        }));
    };

    // Projects management
    const addProject = () => {
        setCvData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), {
                name: "",
                description: "",
                technologies: [],
                link: ""
            }]
        }));
    };

    const updateProject = (index: number, field: keyof Project, value: any) => {
        setCvData(prev => ({
            ...prev,
            projects: prev.projects?.map((project, i) => 
                i === index ? { ...project, [field]: value } : project
            ) || []
        }));
    };    if (fetchLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto rounded-lg  p-6">
                <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-light_blue-500"></div>
                </div>
            </div>
        );
    }    // Helper function to render interactive skill level bar
    const renderSkillLevel = (level: string, onLevelChange?: (newLevel: string) => void) => {
        const levels = {
            "Beginner": 1,
            "Intermediate": 2,
            "Advanced": 3,
            "Expert": 4
        };
        const levelNames = ["Beginner", "Intermediate", "Advanced", "Expert"];
        const bars = levels[level as keyof typeof levels] || 1;
        
        const handleBarClick = (clickedIndex: number) => {
            if (onLevelChange) {
                const newLevel = levelNames[clickedIndex];
                onLevelChange(newLevel);
            }
        };
        
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-5 rounded-full cursor-pointer transition-colors hover:opacity-80 ${
                            i < bars ? 'bg-light_blue-500' : 'bg-white/20 hover:bg-white/30'
                        }`}
                        onClick={() => handleBarClick(i)}
                        title={`Set to ${levelNames[i]}`}
                    />
                ))}
                <span className="ml-2 text-xs text-white/60">{level}</span>
            </div>
        );
    };

    return (
        <div className="w-full max-w-6xl mx-auto space-y-8 text-whitep-6">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Summary Section */}
                <div>
                    <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                        Professional Summary
                    </h3>
                    <div className="bg-white/5 p-4 rounded-lg">
                        <Textarea
                            placeholder="Write a brief professional summary..."
                            value={cvData.summary || ""}
                            onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                            minRows={4}
                            maxRows={8}
                            classNames={{
                                input: "bg-transparent text-white placeholder:text-white/60",
                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                            }}
                        />
                    </div>
                </div>                {/* Skills Section */}
                {cvData.skills && cvData.skills.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-light_blue border-b border-white/10 pb-2">
                                Skills
                            </h3>
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<MdAdd />}
                                onClick={addSkill}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Skill
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {cvData.skills.map((skill, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3 w-full">                                    <div className="flex justify-between items-start">
                                        <div className="flex justify-between items-center gap-3 w-full">
                                            <Input
                                                placeholder="Skill Name"
                                                value={skill.name}
                                                onChange={(e) => updateSkill(index, "name", e.target.value)}
                                                classNames={{
                                                    input: "bg-transparent text-white placeholder:text-white/60",
                                                    inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                                }}
                                            />
                                        
                                        <Input
                                            placeholder="Years"
                                            type="number"
                                            value={skill.yearsOfExperience.toString()}
                                            onChange={(e) => updateSkill(index, "yearsOfExperience", parseInt(e.target.value) || 0)}
                                            className="w-14"
                                            classNames={{
                                                input: "bg-transparent text-white placeholder:text-white/60",
                                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                            }}
                                        />  
                                        </div>
                                        
                                    </div>
                                    <div className="flex gap-3 items-center justify-between">                                        
                                                                          
                                    {renderSkillLevel(skill.level, (newLevel) => updateSkill(index, "level", newLevel))}
                                    <Button
                                            color="danger"
                                            size="sm"
                                            isIconOnly
                                            onClick={() => removeFromArray("skills", index)}
                                            className="ml-2"
                                        >
                                            <MdDelete />
                                        </Button>
                                    
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Add Skills Button when no skills exist */}
                {(!cvData.skills || cvData.skills.length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Skills
                        </h3>
                        <div className="bg-white/5 p-4 rounded-lg text-center">
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<MdAdd />}
                                onClick={addSkill}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Your First Skill
                            </Button>
                        </div>
                    </div>
                )}                {/* Work Experience Section */}
                {cvData.workExperience && cvData.workExperience.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-light_blue border-b border-white/10 pb-2">
                                Work Experience
                            </h3>
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<MdAdd />}
                                onClick={addWorkExperience}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Experience
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {cvData.workExperience.map((exp, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-light_blue font-medium text-lg">
                                                {exp.role || `Experience ${index + 1}`}
                                            </h4>
                                            <p className="text-white/80 text-sm">
                                                {exp.company} • {exp.duration}
                                            </p>
                                        </div>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            isIconOnly
                                            onClick={() => removeFromArray("workExperience", index)}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Company"
                                            value={exp.company}
                                            onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                                            classNames={{
                                                input: "bg-transparent text-white placeholder:text-white/60",
                                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                            }}
                                        />
                                        <Input
                                            placeholder="Role"
                                            value={exp.role}
                                            onChange={(e) => updateWorkExperience(index, "role", e.target.value)}
                                            classNames={{
                                                input: "bg-transparent text-white placeholder:text-white/60",
                                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                            }}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Duration (e.g., Jan 2020 - Dec 2022)"
                                        value={exp.duration}
                                        onChange={(e) => updateWorkExperience(index, "duration", e.target.value)}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Textarea
                                        placeholder="Responsibilities (one per line)"
                                        value={exp.responsibilities?.join('\n') || ""}
                                        onChange={(e) => updateWorkExperience(index, "responsibilities", e.target.value.split('\n').filter(r => r.trim()))}
                                        minRows={3}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Textarea
                                        placeholder="Technologies (one per line)"
                                        value={exp.technologies?.join('\n') || ""}
                                        onChange={(e) => updateWorkExperience(index, "technologies", e.target.value.split('\n').filter(t => t.trim()))}
                                        minRows={2}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    {exp.technologies && exp.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {exp.technologies.map((tech, techIndex) => (
                                                <Chip key={techIndex} size="sm" className="bg-light_blue-500/20 text-light_blue text-xs">
                                                    {tech}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Add Work Experience Button when no experience exists */}
                {(!cvData.workExperience || cvData.workExperience.length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Work Experience
                        </h3>
                        <div className="bg-white/5 p-4 rounded-lg text-center">
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<MdAdd />}
                                onClick={addWorkExperience}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Your First Work Experience
                            </Button>
                        </div>
                    </div>
                )}                {/* Education Section */}
                {cvData.education && cvData.education.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-light_blue border-b border-white/10 pb-2">
                                Education
                            </h3>
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<MdAdd />}
                                onClick={addEducation}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Education
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {cvData.education.map((edu, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-light_blue font-medium text-lg">
                                                {edu.degree || `Education ${index + 1}`}
                                            </h4>
                                            <p className="text-white/80 text-sm">
                                                {edu.institution} • {edu.year}
                                            </p>
                                        </div>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            isIconOnly
                                            onClick={() => removeFromArray("education", index)}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            placeholder="Degree"
                                            value={edu.degree}
                                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                            classNames={{
                                                input: "bg-transparent text-white placeholder:text-white/60",
                                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                            }}
                                        />
                                        <Input
                                            placeholder="Institution"
                                            value={edu.institution}
                                            onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                            classNames={{
                                                input: "bg-transparent text-white placeholder:text-white/60",
                                                inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                            }}
                                        />
                                    </div>
                                    <Input
                                        placeholder="Year"
                                        value={edu.year}
                                        onChange={(e) => updateEducation(index, "year", e.target.value)}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Textarea
                                        placeholder="Relevant Courses (one per line)"
                                        value={edu.relevantCourses?.join('\n') || ""}
                                        onChange={(e) => updateEducation(index, "relevantCourses", e.target.value.split('\n').filter(c => c.trim()))}
                                        minRows={2}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                                        <div className="mt-2">
                                            <span className="text-sm text-white/60 font-medium">Relevant Courses:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {edu.relevantCourses.map((course, courseIndex) => (
                                                    <Chip key={courseIndex} size="sm" className="bg-light_blue-500/20 text-light_blue text-xs">
                                                        {course}
                                                    </Chip>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Add Education Button when no education exists */}
                {(!cvData.education || cvData.education.length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Education
                        </h3>
                        <div className="bg-white/5 p-4 rounded-lg text-center">
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<MdAdd />}
                                onClick={addEducation}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Your First Education
                            </Button>
                        </div>
                    </div>
                )}                {/* Projects Section */}
                {cvData.projects && cvData.projects.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-light_blue border-b border-white/10 pb-2">
                                Projects
                            </h3>
                            <Button
                                color="primary"
                                size="sm"
                                startContent={<MdAdd />}
                                onClick={addProject}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Project
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {cvData.projects.map((project, index) => (
                                <div key={index} className="bg-white/5 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="text-light_blue font-medium text-lg">
                                                {project.name || `Project ${index + 1}`}
                                            </h4>
                                            <p className="text-white/80 text-sm">
                                                {project.description}
                                            </p>
                                            {project.link && (
                                                <a href={project.link} target="_blank" rel="noopener noreferrer" 
                                                   className="text-light_blue-400 hover:text-light_blue-300 text-sm underline">
                                                    View Project
                                                </a>
                                            )}
                                        </div>
                                        <Button
                                            color="danger"
                                            size="sm"
                                            isIconOnly
                                            onClick={() => removeFromArray("projects", index)}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Project Name"
                                        value={project.name}
                                        onChange={(e) => updateProject(index, "name", e.target.value)}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Textarea
                                        placeholder="Description"
                                        value={project.description}
                                        onChange={(e) => updateProject(index, "description", e.target.value)}
                                        minRows={3}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Input
                                        placeholder="Project Link (optional)"
                                        value={project.link || ""}
                                        onChange={(e) => updateProject(index, "link", e.target.value)}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    <Textarea
                                        placeholder="Technologies (one per line)"
                                        value={project.technologies?.join('\n') || ""}
                                        onChange={(e) => updateProject(index, "technologies", e.target.value.split('\n').filter(t => t.trim()))}
                                        minRows={2}
                                        classNames={{
                                            input: "bg-transparent text-white placeholder:text-white/60",
                                            inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                        }}
                                    />
                                    {project.technologies && project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {project.technologies.map((tech, techIndex) => (
                                                <Chip key={techIndex} size="sm" className="bg-light_blue-500/20 text-light_blue text-xs">
                                                    {tech}
                                                </Chip>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Add Projects Button when no projects exist */}
                {(!cvData.projects || cvData.projects.length === 0) && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Projects
                        </h3>
                        <div className="bg-white/5 p-4 rounded-lg text-center">
                            <Button
                                color="primary"
                                size="lg"
                                startContent={<MdAdd />}
                                onClick={addProject}
                                className="bg-light_blue-500 hover:bg-light_blue-600"
                            >
                                Add Your First Project
                            </Button>
                        </div>
                    </div>
                )}                {/* Additional Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Languages */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Languages
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.languages?.map((lang, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("languages", index)}
                                        variant="flat"
                                        className="bg-light_blue-500/20 text-light_blue"
                                    >
                                        {lang}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a language and press Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("languages", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                classNames={{
                                    input: "bg-transparent text-white placeholder:text-white/60",
                                    inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                }}
                            />
                        </div>
                    </div>

                    {/* Certifications */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Certifications
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.certifications?.map((cert, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("certifications", index)}
                                        variant="flat"
                                        className="bg-light_blue-500/20 text-light_blue"
                                    >
                                        {cert}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a certification and press Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("certifications", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                classNames={{
                                    input: "bg-transparent text-white placeholder:text-white/60",
                                    inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                }}
                            />
                        </div>
                    </div>

                    {/* Strengths */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Strengths
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.strengths?.map((strength, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("strengths", index)}
                                        variant="flat"
                                        className="bg-light_blue-500/20 text-light_blue"
                                    >
                                        {strength}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a strength and press Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("strengths", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                classNames={{
                                    input: "bg-transparent text-white placeholder:text-white/60",
                                    inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                }}
                            />
                        </div>
                    </div>

                    {/* Recommended Task Types */}
                    <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                            Recommended Task Types
                        </h3>
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.recommendedTaskTypes?.map((taskType, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("recommendedTaskTypes", index)}
                                        variant="flat"
                                        className="bg-light_blue-500/20 text-light_blue"
                                    >
                                        {taskType}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a task type and press Enter"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("recommendedTaskTypes", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                                classNames={{
                                    input: "bg-transparent text-white placeholder:text-white/60",
                                    inputWrapper: "bg-white/10 border-white/20 hover:bg-white/15"
                                }}
                            />
                        </div>
                    </div>
                </div>                {/* Submit Button */}
                <div className="flex justify-center pt-6 border-t border-white/10">
                    <Button
                        type="submit"
                        size="lg"
                        startContent={<MdSave />}
                        isLoading={loading}
                        disabled={loading}
                        className="bg-light_blue-500 hover:bg-light_blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors"
                    >
                        {loading ? "Saving..." : "Save CV Information"}
                    </Button>
                </div>
            </form>
        </div>
    );
}