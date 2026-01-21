"use client"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Input,
} from "@heroui/react";
import { useState } from "react";
import { FileItem, FolderItem } from "../types/filesTypes";
import { useFilesContext } from "../hooks/useFilesContext";
import { toast } from "react-toastify";

export default function EditModal({isOpen, onOpenChange,object}:{isOpen: boolean, onOpenChange?: () => void,object : FolderItem | FileItem}) {

  const { editFolder, editFile } = useFilesContext(); // Destructure editFile

  const [name,setName] = useState("");
  const [error,setError] = useState("");
  const [isLoading,setIsLoading] = useState(false);

  const type: "file" | "folder" = "type" in object ? "file" : "folder"

  const handleInputChange = (e : any) => {
    setName(e.target.value);
    setError("");
  }

  const handleEdit = async (e : any) => {
    
    e.preventDefault();

    if(name === "") {
      setError(`Please enter a ${type} name`); // Generic message
      return;
    }

    if(name === object.name) {
      onOpenChange?.();
      return;
    }

    if(name.length <= 2) {
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} name must be at least 2 characters long`); // Generic message
      return;
    }

    if(name.length > 50) {
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} name cannot exceed 50 characters`); // Generic message
      return;
    }

    try{
      setIsLoading(true);

      if (type === "file") {
        await editFile(object.id, name); // Call editFile
        toast.success("File edited successfully");
      }
      else {
        await editFolder(object.id,{folderName:name});
        toast.success("Folder edited successfully");
      }

      onOpenChange?.();
    }
    catch (error) {
      console.log(error)
      toast.error("Something went wrong");
    }
    finally {
      setIsLoading(false);
    }
    
  }

  return (
    <>
      <Modal isOpen={isOpen} 
                radius="sm" 
                classNames={{
                    base: "bg-modal_bg border rounded-lg border-white/20",
                    header: "text-light_blue-500 border-b border-white/20",
                    body: "pt-6",
                    closeButton: "text-white/60 hover:text-white/80"
                  }} 
                onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Edit {type}</ModalHeader>
              <ModalBody>
              <form onSubmit={(e : any) => {handleEdit(e)}} className="flex flex-col gap-4">
                <Input
                    isRequired
                    variant="bordered"
                    className="w-full text-white dark"
                    placeholder={`Enter the ${type} name`} // Generic placeholder
                    label={`${type.charAt(0).toUpperCase() + type.slice(1)} Name`} // Generic label
                    value={name}
                    onChange={handleInputChange}
                    type="text"
                    isInvalid={!!error}
                    errorMessage={error}
                />
                <div className="flex justify-end gap-2 w-full mb-3">
                  <Button
                    variant="light"
                    onPress={onClose}
                    className="text-white/60 dark hover:text-white hover:bg-white/10"
                >
                    Cancel
                </Button>
                <Button 
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    type="submit" 
                    className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                >
                    Edit
                </Button>
                </div>
              </form>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
