"use client"
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    ModalFooter,
} from "@heroui/react";
import { User, UserCvInfo } from "./types/types";
import { useUsers } from "./hooks/useUsers";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import MailForCvButton from "./mailForCvButton";
import { PiWarningBold } from "react-icons/pi";
import { MdTaskAlt } from "react-icons/md";
export default function InfoModal({
    isOpen, 
    onOpenChange, 
    user, 
    company_id
}: {
    isOpen: boolean, 
    onOpenChange: (isOpen: boolean) => void,
    user: User,
    company_id: string
}) {
    const { GetCvInformations } = useUsers(company_id);
    const [isLoading, setIsLoading] = useState(false);
    const [informations, setInformations] = useState<UserCvInfo | null>(null);

    const fetchInformations = useCallback(async () => {
        if (!user?.id) return;
        
        setIsLoading(true);
        try {
            const data = await GetCvInformations(user.id);
            setInformations(data);
        } catch (err) {
            console.error("Error fetching CV information:", err);
            toast.error("Failed to load CV information");
        } finally {
            setIsLoading(false);
        }
    }, [GetCvInformations, user?.id]);

    useEffect(() => {
        if (isOpen && user?.id) {
            fetchInformations();
        }
    }, [isOpen, fetchInformations, user?.id]);

    // Helper function to render skill level bar
    const renderSkillLevel = (level: string) => {
        const levels = {
            "Beginner": 1,
            "Intermediate": 2,
            "Advanced": 3,
            "Expert": 4
        };
        const bars = levels[level as keyof typeof levels] || 1;
        
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div 
                        key={i} 
                        className={`h-1.5 w-5 rounded-full ${i < bars ? 'bg-light_blue-500' : 'bg-white/20'}`}
                    />
                ))}
                <span className="ml-2 text-xs text-white/60">{level}</span>
            </div>
        );
    };

    return (
        <Modal 
            isOpen={isOpen} 
            onOpenChange={onOpenChange}
            classNames={{
                base: "bg-modal_bg border rounded-lg border-white/20",
                header: "text-light_blue-500 border-b border-white/20",
                body: "pt-6",
                closeButton: "text-white/60 hover:text-white/10"
            }} 
            size="3xl"
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-light_blue-500">
                            See {user.first_name}&apos;s informations
                        </ModalHeader>
                        <ModalBody className="p-6 max-h-[70vh] overflow-y-auto">
                            {isLoading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-light_blue-500"></div>
                                </div>
                            ) : !informations ? (
                                <div className="text-center text-white/60 py-10 flex flex-col justify-center items-center gap-5">
                                    <div className="flex flex-col justify-center items-center w-full gap-2 text-danger-500">
                                        <PiWarningBold size={60} />
                                        <p className="mt-1 text-lg w-[80%]">
                                            This user hasn&apos;t submitted their CV. Send a reminder to request their resume.
                                        </p>
                                    </div>
                                    
                                    {/* <MailForCvButton/> */}
                                </div>
                            ) : (
                                <div className="space-y-8 text-white">
                                    {/* Summary Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                            Professional Summary
                                        </h3>
                                        <p className="text-white/80 leading-relaxed">
                                            {informations.summary || "No summary provided"}
                                        </p>
                                    </div>

                                    {/* Skills Section */}
                                    {informations.skills?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                Skills
                                            </h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {informations.skills.map((skill, index) => (
                                                    <div key={index} className="bg-white/5 p-3 rounded-lg">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <h4 className="font-medium text-light_blue-200">{skill.name}</h4>
                                                            <span className="text-xs text-white/60">{skill.yearsOfExperience} {skill.yearsOfExperience === 1 ? 'year' : 'years'}</span>
                                                        </div>
                                                        {renderSkillLevel(skill.level)}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Work Experience Section */}
                                    {informations.workExperience?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                Work Experience
                                            </h3>
                                            <div className="space-y-4">
                                                {informations.workExperience.map((exp, index) => (
                                                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-light_blue-200">{exp.role}</h4>
                                                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/80">{exp.duration}</span>
                                                        </div>
                                                        <p className="text-white/60 text-sm mb-2">{exp.company}</p>
                                                        
                                                        <div className="mt-3">
                                                            <h5 className="text-sm font-medium text-white/80 mb-1">Responsibilities:</h5>
                                                            <ul className="list-disc pl-5 text-sm text-white/70 space-y-1">
                                                                {exp.responsibilities.map((resp, idx) => (
                                                                    <li key={idx}>{resp}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        
                                                        {exp.technologies.length > 0 && <div className="mt-3">
                                                            <h5 className="text-sm font-medium text-white/80 mb-2">Technologies:</h5>
                                                            <div className="flex flex-wrap gap-2">
                                                                { exp.technologies.map((tech, idx) => (
                                                                    <span key={idx} className="bg-light_blue-500/80 text-dark_blue text-xs px-2 py-1 rounded font-semibold">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Education Section */}
                                    {informations.education?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                Education
                                            </h3>
                                            <div className="space-y-4">
                                                {informations.education.map((edu, index) => (
                                                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start">
                                                            <h4 className="font-medium text-light_blue-200">{edu.degree}</h4>
                                                            <span className="text-xs bg-white/10 px-2 py-1 rounded text-white/80">{edu.year}</span>
                                                        </div>
                                                        <p className="text-white/60 text-sm mt-1">{edu.institution}</p>
                                                        
                                                        {edu.relevantCourses && edu.relevantCourses.length > 0 && (
                                                            <div className="mt-3">
                                                                <h5 className="text-sm font-medium text-white/80 mb-1">Relevant Courses:</h5>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {edu.relevantCourses.map((course, idx) => (
                                                                        <span key={idx} className="bg-light_blue-500/80 text-dark_blue text-xs px-2 py-1 rounded font-semibold">
                                                                            {course}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Projects Section */}
                                    {informations.projects && informations.projects?.length > 0 && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                Projects
                                            </h3>
                                            <div className="space-y-4">
                                                {informations.projects?.map((project, index) => (
                                                    <div key={index} className="bg-white/5 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-medium text-light_blue-200">{project.name}</h4>
                                                            {project.link && (
                                                                <a 
                                                                    href={project.link} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs bg-light_blue-500/30 text-light_blue-300 px-2 py-1 rounded hover:bg-light_blue-500/50 transition-colors"
                                                                >
                                                                    View Project
                                                                </a>
                                                            )}
                                                        </div>
                                                        <p className="text-white/80 text-sm mb-3">{project.description}</p>
                                                        
                                                        {project.technologies && project.technologies.length > 0 && <div className="flex flex-wrap gap-2">
                                                            {project.technologies.map((tech, idx) => (
                                                                <span key={idx} className="bg-light_blue-500/80 text-dark_blue font-semibold text-xs px-2 py-1 rounded">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                        {informations.languages && informations.languages?.length > 0 && (
                                            <div>
                                            <h3 className="text-lg font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                Languages
                                            </h3>
                                            <div className="bg-white/5 p-4 rounded-lg">
                                                <div className="flex flex-wrap gap-2">
                                                    {informations.languages.map((lang, index) => (
                                                        <span key={index} className=" bg-light_blue-500/80 text-dark_blue font-semibold text-sm px-3 py-1 rounded">
                                                            {lang}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            </div>
                                        )}

                                        {/* Certifications Section */}
                                        {informations.certifications && informations.certifications?.length > 0 && (
                                            <div>
                                                <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                        Certifications
                                                </h3>
                                                <div className="bg-white/5 p-4 rounded-lg">
                                                    <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
                                                        {informations.certifications.map((cert, index) => (
                                                            <li key={index}>{cert}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                    {/* Additional Sections */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                        {/* Strengths Section */}
                                        {informations.strengths?.length > 0 && (
                                            <div className="bg-white/5 p-4 rounded-lg">
                                                <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                    Strengths
                                                </h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {informations.strengths.map((strength, index) => (
                                                        <span key={index} className="bg-light_blue-500/80 text-dark_blue text-sm px-3 py-1 rounded font-semibold">
                                                            {strength}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommended Task Types Section */}
                                        {informations.recommendedTaskTypes?.length > 0 && (
                                            <div className="bg-white/5 p-4 rounded-lg">
                                                <h3 className="text-base font-semibold mb-3 text-light_blue border-b border-white/10 pb-2">
                                                    Recommended Task Types
                                                </h3>
                                                <div className="flex flex-col flex-wrap gap-2 w-full">
                                                    {informations.recommendedTaskTypes.map((task, index) => (
                                                        <span key={index} className="text-white/80 text-sm rounded flex gap-2 ">
                                                            <MdTaskAlt className="text-light_blue-500/80 mt-1"/>
                                                            {task}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                            
                        <ModalFooter className="flex justify-end gap-2 w-full">
                            <Button
                                variant="light"
                                onPress={onClose}
                                className="text-white/60 hover:text-white hover:bg-white/10 rounded-md"
                            >
                                Close
                            </Button>
                            {!informations && !isLoading && <MailForCvButton email={user.email}/>}
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}