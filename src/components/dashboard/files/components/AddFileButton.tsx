"use client"
import {
  Modal,
  ModalContent,
  Button,
  useDisclosure,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { FormEvent, useRef, useCallback, useState, ChangeEvent } from "react";
import { FolderPlus, Upload, X, FileText } from "lucide-react";
import { useFilesContext } from "../hooks/useFilesContext";
import { toast } from "react-toastify";

interface FileWithPreview {
  file: File;
  name: string;
  size: number;
  type: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function AddFileButton() {
  const { addFile, currentFolder } = useFilesContext();
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File ${file.name} exceeds 100MB limit`);
      return false;
    }

    return true;
  };

  const handleFiles = useCallback((newFiles: FileList) => {
    const validFiles = Array.from(newFiles)
      .filter(validateFile)
      .map(file => ({
        file,
        name: file.name,
        size: file.size,
        type: file.type
      }));

    setSelectedFiles(prev => [...prev, ...validFiles]);
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, onClose: () => void) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setLoading(true);
    const parentFolderId = currentFolder?.id || null; // Get current folder ID from context
    let uploadSuccess = true;
    let errorCount = 0;

    // Use Promise.all to upload files concurrently (or sequentially if preferred)
    const uploadPromises = selectedFiles.map(fileData =>
      addFile(fileData.file, parentFolderId)
        .catch(err => {
          console.error(`Failed to upload ${fileData.name}:`, err);
          toast.error(`Failed to upload ${fileData.name}: ${err.message || 'Unknown error'}`);
          uploadSuccess = false;
          errorCount++;
          return null;
        })
    );

    try {
      await Promise.all(uploadPromises);

      if (uploadSuccess) {
        toast.success(`${selectedFiles.length} file(s) uploaded successfully!`);
        setSelectedFiles([]); // Clear selection on complete success
        onClose(); // Close modal on complete success
      } else {
         // Handle partial success scenario
         toast.warn(`Uploaded ${selectedFiles.length - errorCount} out of ${selectedFiles.length} files. Some uploads failed.`);
         // Optionally, keep the modal open or clear only successfully uploaded files
         // For simplicity here, we'll clear selection and close modal even on partial success
         // A more robust implementation might filter `selectedFiles` based on success/failure
         setSelectedFiles([]);
         onClose();
      }

    } catch (error) {
      // This catch block might not be strictly necessary if individual errors are caught above,
      // but it's good practice for unexpected errors in Promise.all itself.
      console.error("An unexpected error occurred during uploads:", error);
      toast.error("An unexpected error occurred during the upload process.");
      // Decide whether to close the modal or keep it open
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        className="dark bg-light_blue-500/10 hover:bg-light_blue-500/20 w-fit flex-shrink-0"
        startContent={<FolderPlus className="w-4 h-4" />}
        onPress={onOpen}
        title="Upload Files"
      >
        Add files
      </Button>
      
      <Modal 
        isOpen={isOpen} 
        radius="sm" 
        size="lg"
        classNames={{
          base: "bg-modal_bg border rounded-lg border-white/20",
          header: "text-light_blue-500 border-b border-white/20",
          body: "pt-6",
          closeButton: "text-white/60 hover:text-white/80"
        }} 
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={(e) => handleSubmit(e, onClose)}>
              <ModalHeader className="flex flex-col gap-1">Upload Files</ModalHeader>
              <ModalBody className="w-full flex flex-col gap-3">
                <div 
                  className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isDragging ? 'border-light_blue-500 bg-blue-100/10' : 'border-gray-400 hover:border-blue-400'
                  }`}
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
                    multiple
                  />
                  
                  {selectedFiles.length === 0 ? (
                    <div className="text-center">
                      <Upload className="w-12 h-12 mx-auto text-light_blue mb-4" />
                      <p className="text-white font-medium mb-1">Drag and drop files here</p>
                      <p className="text-gray-400 text-sm">or click to browse files</p>
                      <p className="text-gray-500 text-xs mt-4">
                        Supported formats: PDF, DOC, DOCX (Max 100MB each)
                      </p>
                    </div>
                  ) : (
                    <div className="text-center w-full p-4">
                      <Upload className="w-12 h-12 mx-auto text-light_blue mb-4" />
                      <p className="text-white font-medium mb-4">
                        {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                      </p>
                    </div>
                  )}
                </div>

                {selectedFiles.length > 0 && (
                  <div className="w-full max-h-64 overflow-y-auto">
                    <ul className="space-y-2">
                      {selectedFiles.map((fileData, index) => (
                        <li 
                          key={index}
                          className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-white text-sm">{fileData.name}</span>
                            <span className="text-gray-400 text-xs">
                              ({(fileData.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="text-gray-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </ModalBody>

              <ModalFooter>
                <Button 
                  type="submit" 
                  isDisabled={selectedFiles.length === 0 || loading}
                  isLoading={loading}
                  size="md"
                  radius="sm"
                  className="bg-light_blue-500 text-dark_blue text-medium font-semibold w-full flex-shrink-0"
                >
                  {loading ? 'Uploading...' : selectedFiles ? 'Upload' : 'Select files'}
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}