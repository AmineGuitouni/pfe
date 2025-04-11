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
import { UseColumns } from "../../context/columnsContext";
import { useSearchParams } from "next/navigation";
import SelectColStatus from "./selectColStatus";


export default function AddModal({isOpen, onOpenChange}:{isOpen: boolean, onOpenChange: () => void}) {

  const [name,setName] = useState("");
  const [error,setError] = useState("");
  const [isLoading,setIsLoading] = useState(false);
  const { AddColumn } = UseColumns();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project_id");
  const [selectedState, setSelectedState] = useState("");

  const handleInputChange = (e : any) => {
    setName(e.target.value);
    setError("");
  }


  const handleAddColumn = async (e : any, onClose: () => void) => {

    e.preventDefault();
    // Check if we have an active project
    if (!projectId ) {
        setError("Please select a project first");
        return;
    }

    if( !name || name === "" ) {
        setError("Please enter a column name");
        return
    }

    if(name.length <= 2) {
        setError("Column name must be at least 2 characters long");
        return
    }

    if(name.length > 50) {
        setError("Column name cannot exceed 50 characters");
        return
    }

    if(selectedState === "") {
        setError("Please select a column status");
        return
    }

    try{
        setIsLoading(true);
        await AddColumn(name,projectId,onClose,selectedState);
    }
    catch(error : any) {
        setError(error.message);
    }
    finally {
        setIsLoading(false);
    }
    
};

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
              <ModalHeader className="flex flex-col gap-1">Add column</ModalHeader>
              <ModalBody>
              <form onSubmit={(e : any) => {handleAddColumn(e,onClose)}} className="flex flex-col gap-4">
                <Input
                    isRequired
                    variant="bordered"
                    className="w-full text-white dark"
                    placeholder="Enter the column name"
                    label="Column Name"
                    value={name}
                    onChange={handleInputChange}
                    type="text"
                    isInvalid={!!error}
                    errorMessage={error}
                />

                <SelectColStatus selectedValue={selectedState} onSelectionChange={setSelectedState} />

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
                    isDisabled={!projectId || isLoading || !!error}
                    type="submit" 
                    className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                >
                    Add
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
