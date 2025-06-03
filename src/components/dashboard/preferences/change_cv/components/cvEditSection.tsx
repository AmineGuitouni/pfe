"use client"
import { Button, Input, Textarea, Card, CardBody, CardHeader, Chip } from "@heroui/react";
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
    }, [session]);

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
    };

    if (fetchLoading) {
        return (
            <div className="w-full flex justify-center items-center p-8">
                <div className="text-lg">Loading CV data...</div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Summary Section */}
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">Professional Summary</h2>
                    </CardHeader>
                    <CardBody>
                        <Textarea
                            label="Summary"
                            placeholder="Write a brief professional summary..."
                            value={cvData.summary || ""}
                            onChange={(e) => setCvData(prev => ({ ...prev, summary: e.target.value }))}
                            minRows={4}
                            maxRows={8}
                        />
                    </CardBody>
                </Card>

                {/* Skills Section */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Skills</h2>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<MdAdd />}
                            onClick={addSkill}
                        >
                            Add Skill
                        </Button>
                    </CardHeader>
                    <CardBody className="space-y-4">
                        {cvData.skills?.map((skill, index) => (
                            <div key={index} className="flex gap-3 items-end">
                                <Input
                                    label="Skill Name"
                                    value={skill.name}
                                    onChange={(e) => updateSkill(index, "name", e.target.value)}
                                    className="flex-1"
                                />
                                <select
                                    value={skill.level}
                                    onChange={(e) => updateSkill(index, "level", e.target.value)}
                                    className="px-3 py-2 border rounded-lg"
                                >
                                    <option value="Beginner">Beginner</option>
                                    <option value="Intermediate">Intermediate</option>
                                    <option value="Advanced">Advanced</option>
                                    <option value="Expert">Expert</option>
                                </select>
                                <Input
                                    label="Years"
                                    type="number"
                                    value={skill.yearsOfExperience.toString()}
                                    onChange={(e) => updateSkill(index, "yearsOfExperience", parseInt(e.target.value) || 0)}
                                    className="w-20"
                                />
                                <Button
                                    color="danger"
                                    size="sm"
                                    isIconOnly
                                    onClick={() => removeFromArray("skills", index)}
                                >
                                    <MdDelete />
                                </Button>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Work Experience Section */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Work Experience</h2>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<MdAdd />}
                            onClick={addWorkExperience}
                        >
                            Add Experience
                        </Button>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        {cvData.workExperience?.map((exp, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium">Experience {index + 1}</h3>
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
                                        label="Company"
                                        value={exp.company}
                                        onChange={(e) => updateWorkExperience(index, "company", e.target.value)}
                                    />
                                    <Input
                                        label="Role"
                                        value={exp.role}
                                        onChange={(e) => updateWorkExperience(index, "role", e.target.value)}
                                    />
                                </div>
                                <Input
                                    label="Duration"
                                    placeholder="e.g., Jan 2020 - Dec 2022"
                                    value={exp.duration}
                                    onChange={(e) => updateWorkExperience(index, "duration", e.target.value)}
                                />
                                <Textarea
                                    label="Responsibilities (one per line)"
                                    value={exp.responsibilities?.join('\n') || ""}
                                    onChange={(e) => updateWorkExperience(index, "responsibilities", e.target.value.split('\n').filter(r => r.trim()))}
                                    minRows={3}
                                />
                                <Textarea
                                    label="Technologies (one per line)"
                                    value={exp.technologies?.join('\n') || ""}
                                    onChange={(e) => updateWorkExperience(index, "technologies", e.target.value.split('\n').filter(t => t.trim()))}
                                    minRows={2}
                                />
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Education Section */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Education</h2>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<MdAdd />}
                            onClick={addEducation}
                        >
                            Add Education
                        </Button>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        {cvData.education?.map((edu, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium">Education {index + 1}</h3>
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
                                        label="Degree"
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                    />
                                    <Input
                                        label="Institution"
                                        value={edu.institution}
                                        onChange={(e) => updateEducation(index, "institution", e.target.value)}
                                    />
                                </div>
                                <Input
                                    label="Year"
                                    value={edu.year}
                                    onChange={(e) => updateEducation(index, "year", e.target.value)}
                                />
                                <Textarea
                                    label="Relevant Courses (one per line)"
                                    value={edu.relevantCourses?.join('\n') || ""}
                                    onChange={(e) => updateEducation(index, "relevantCourses", e.target.value.split('\n').filter(c => c.trim()))}
                                    minRows={2}
                                />
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Projects Section */}
                <Card>
                    <CardHeader className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Projects</h2>
                        <Button
                            color="primary"
                            size="sm"
                            startContent={<MdAdd />}
                            onClick={addProject}
                        >
                            Add Project
                        </Button>
                    </CardHeader>
                    <CardBody className="space-y-6">
                        {cvData.projects?.map((project, index) => (
                            <div key={index} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-medium">Project {index + 1}</h3>
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
                                    label="Project Name"
                                    value={project.name}
                                    onChange={(e) => updateProject(index, "name", e.target.value)}
                                />
                                <Textarea
                                    label="Description"
                                    value={project.description}
                                    onChange={(e) => updateProject(index, "description", e.target.value)}
                                    minRows={3}
                                />
                                <Input
                                    label="Project Link (optional)"
                                    value={project.link || ""}
                                    onChange={(e) => updateProject(index, "link", e.target.value)}
                                />
                                <Textarea
                                    label="Technologies (one per line)"
                                    value={project.technologies?.join('\n') || ""}
                                    onChange={(e) => updateProject(index, "technologies", e.target.value.split('\n').filter(t => t.trim()))}
                                    minRows={2}
                                />
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Simple Array Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Languages */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Languages</h2>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.languages?.map((lang, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("languages", index)}
                                        variant="flat"
                                    >
                                        {lang}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a language"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("languages", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>

                    {/* Certifications */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Certifications</h2>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.certifications?.map((cert, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("certifications", index)}
                                        variant="flat"
                                    >
                                        {cert}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a certification"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("certifications", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>

                    {/* Strengths */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Strengths</h2>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.strengths?.map((strength, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("strengths", index)}
                                        variant="flat"
                                    >
                                        {strength}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a strength"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("strengths", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>

                    {/* Recommended Task Types */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold">Recommended Task Types</h2>
                        </CardHeader>
                        <CardBody className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {cvData.recommendedTaskTypes?.map((taskType, index) => (
                                    <Chip
                                        key={index}
                                        onClose={() => removeFromArray("recommendedTaskTypes", index)}
                                        variant="flat"
                                    >
                                        {taskType}
                                    </Chip>
                                ))}
                            </div>
                            <Input
                                placeholder="Add a task type"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        addStringToArray("recommendedTaskTypes", e.currentTarget.value);
                                        e.currentTarget.value = "";
                                    }
                                }}
                            />
                        </CardBody>
                    </Card>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                    <Button
                        type="submit"
                        color="primary"
                        size="lg"
                        startContent={<MdSave />}
                        isLoading={loading}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save CV Information"}
                    </Button>
                </div>
            </form>
        </div>
    );
}