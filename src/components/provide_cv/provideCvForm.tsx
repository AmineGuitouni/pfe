"use client"

import { extractTextFromPdf } from '@/lib/ai/extractTextFromPdf';
import { Button } from '@heroui/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';
import { toast } from 'react-toastify';
import useLocalStorage from '@/hooks/useLocalStorage';

export default function ProvideCvForm() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();
    const {data: session , update} = useSession();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [skipToken, setSkipToken] = useLocalStorage<{ expiry: number } | null>("skip_cv_reminder", null);

    const handleSkip = () => {
        if (session?.user?.company_id) {
            setSkipToken({
                expiry: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
            });
            router.push(`/dashboard/${session.user.company_id}`);
        } else {
            router.push('/');
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // Check file size (10MB limit)
            if (selectedFile.size > 10 * 1024 * 1024) {
                toast.error("File size exceeds 10MB limit");
                return;
            }
            
            // Check file type
            const fileType = selectedFile.type;
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
                toast.error("Please upload a PDF, DOC, or DOCX file");
                return;
            }
            
            setFile(selectedFile);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            
            // Check file size (10MB limit)
            if (droppedFile.size > 10 * 1024 * 1024) {
                toast.error("File size exceeds 10MB limit");
                return;
            }
            
            // Check file type
            const fileType = droppedFile.type;
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(fileType)) {
                toast.error("Please upload a PDF, DOC, or DOCX file");
                return;
            }
            
            setFile(droppedFile);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Authentication check
        if (!session?.user?.id) {
            toast.error("You must be logged in to upload your CV");
            router.push('/login');
            return;
        }
        
        // Role check
        if (session.user.role !== "worker") {
            toast.error("Only worker accounts can upload CVs");
            return;
        }
        
        // Company association check
        if (!session.user.company_id) {
            toast.error("Your account is not associated with any company");
            return;
        }
        
        // File check
        if (!file) {
            toast.error("Please select a file to upload");
            return;
        }
        
        setIsSubmitting(true);
        
        try {

            setLoading(true);
            // Extract text from PDF
            let extractedText;
            try {
                extractedText = await extractTextFromPdf(file);
                if (!extractedText || extractedText.trim() === '') {
                    toast.error("Could not extract text from the file");
                    setIsSubmitting(false);
                    return;
                }
            } catch (extractError) {
                console.error("Text extraction error:", extractError);
                toast.error("Failed to extract text from your CV");
                setIsSubmitting(false);
                return;
            }
            
            // Send to API
            const response = await fetch('/api/cv_parcer', {
                method: "POST",
                body: extractedText,
                headers: {
                    'Content-Type': 'text/plain',
                }
            });
            
            // Handle response
            if (!response.ok) {
                const errorData = await response.json();
                
                switch (response.status) {
                    case 401:
                        toast.error("Authentication error. Please login again.");
                        router.push('/login');
                        break;
                    case 403:
                        toast.error("You don't have permission to perform this action");
                        break;
                    case 400:
                        toast.error(errorData.error || "Invalid CV data provided");
                        break;
                    case 422:
                        toast.error("Failed to process your CV data. Please try a different format.");
                        break;
                    case 502:
                        toast.error("AI processing service unavailable. Please try again later.");
                        break;
                    case 503:
                        toast.error("Database connection error. Please try again later.");
                        break;
                    default:
                        toast.error(errorData.error || "Failed to process your CV");
                }
                
                setIsSubmitting(false);
                return;
            }
            
            // Success case
            const data = await response.json();
            if (data.ok) {
                if(data.cv_informations_id) {
                    await update({
                        cv_informations: data.cv_informations_id,
                    })
                
                    toast.success("CV uploaded successfully!");
                    router.push(`/dashboard/${session.user.company_id}`);
                }
                else {
                    toast.error("Failed to update session");
                }
            } else {
                toast.error(data.message || "Unknown error occurred");
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error("CV upload error:", err);
            toast.error("Network or server error. Please try again later.");
            setIsSubmitting(false);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <form 
            className="w-[500px] max-h-[600px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8"
            onSubmit={handleSubmit}
        >
            <div className="w-full flex flex-col gap-3">
                <h2 className="text-2xl font-semibold mb-2 text-white text-center">Upload your CV</h2>
                <p className="text-gray-300 mb-6">
                    Please upload your CV to help us identify which tasks match your skills and experience. 
                    This will allow us to suggest the most relevant opportunities for you.
                </p>
                
                <div 
                    className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-light_blue-500 bg-blue-100/10' : 'border-gray-400 hover:border-blue-400'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx"
                    />
                    
                    {file ? (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <p className="text-white font-medium">{file.name}</p>
                            <p className="text-gray-400 text-sm mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            <button 
                                type="button"
                                className="mt-4 text-sm text-light_blue-500 hover:text-blue-300 underline"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setFile(null);
                                }}
                            >
                                Choose different file
                            </button>
                        </div>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-light_blue mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-white font-medium mb-1">Drag and drop your CV here</p>
                            <p className="text-gray-400 text-sm">or click to browse files</p>
                            <p className="text-gray-500 text-xs mt-4">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
                        </>
                    )}
                </div>
                
                <div className="flex items-center mt-4 text-success-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs">
                        Your CV data will be analyzed securely to match you with appropriate tasks.
                    </p>
                </div>
            </div>
            
            <div className="flex w-full gap-4">
                <Button 
                    type="button" 
                    variant="bordered"
                    onPress={handleSkip}
                    disabled={isSubmitting || loading}
                    className="flex-1 text-white border-white/40 hover:bg-white/10"
                >
                    Remind me later
                </Button>
                <Button 
                    type="submit" 
                    isDisabled={!file || isSubmitting || loading}
                    isLoading={loading}
                    size="md"
                    radius="sm"
                    className="flex-1 bg-light_blue-500 text-dark_blue text-medium font-semibold"
                >
                    {isSubmitting ? 'Processing...' : 'Continue'}
                </Button>
            </div>
        </form>
    )
}