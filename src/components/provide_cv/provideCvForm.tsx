"use client"

import { extractTextFromPdf } from '@/lib/ai/extractTextFromPdf';
import { Button } from '@heroui/react';
import { useState, useRef, ChangeEvent, DragEvent, FormEvent } from 'react';



export default function ProvideCvForm() {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
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
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Handle form submission with the file
        console.log("Submitting file:", file);

        if(!file) return
        try{
            const extractedText = await extractTextFromPdf(file);
            console.log("Extracted text from PDF:", extractedText);
        }
        catch(err){
            console.log(err);
        }
        // You would add your actual submission logic here
    };

    return (
        <form 
            className="w-[500px] max-h-[600px] border-1 p-8 px-4 sm:px-8 rounded-lg shadow-md bg-white/10 border-white/20 relative flex flex-col justify-center items-start gap-8 "
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
                            <p className="text-gray-500 text-xs mt-4">Supported formats: PDF, DOC, DOCX</p>
                        </>
                    )}
                </div>
                
                <div className="flex items-center mt-4 text-success-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4  mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className=" text-xs">
                        Your CV data will be analyzed securely to match you with appropriate tasks.
                    </p>
                </div>
            </div>
            
            <Button 
                type="submit" 
                isDisabled={!file}
                size="md"
                radius="sm"
                className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
                disabled={!file}
            >
                Continue
            </Button>
        </form>
    )
}

