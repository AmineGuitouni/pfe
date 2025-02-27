import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
  } from "@heroui/react";
  import { FaEllipsisVertical } from "react-icons/fa6";
  import { useEffect, useState } from "react";
  
  // Define a more specific type that still allows for dynamic properties
  type DynamicObject = Record<string, any>;
  
  interface DiffResult {
    old: DynamicObject;
    new: DynamicObject;
    changeType: "modified" | "created" | "deleted" | "none";
  }
  
  export default function DetailsModal({oldData, newData,table_name}: {oldData: DynamicObject, newData: DynamicObject,table_name: string}) {
    const {isOpen, onOpen, onOpenChange} = useDisclosure();
    const [differences, setDifferences] = useState<DiffResult>({ 
      old: {}, 
      new: {}, 
      changeType: "none" 
    });

    function findDifferences(oldData: DynamicObject, newData: DynamicObject): DiffResult {

      const oldObj: DynamicObject = oldData || {};
      const newObj: DynamicObject = newData || {};
      
      const differences: DiffResult = {
        old: {},
        new: {},
        changeType: "modified"
      };
      
      // Check if dealing with a complete creation or deletion
      const isOldEmpty = Object.keys(oldObj).length === 0 
      const isNewEmpty = Object.keys(newObj).length === 0;
      
      if (isOldEmpty && !isNewEmpty) {
        // This is a complete creation of new data
        differences.changeType = "created";
        differences.new = {...newObj};
        return differences;
      }
      
      if (!isOldEmpty && isNewEmpty) {
        // This is a complete deletion of old data
        differences.changeType = "deleted";
        differences.old = {...oldObj};
        return differences;
      }
      
      if (isOldEmpty && isNewEmpty) {
        // Both are empty, no changes
        differences.changeType = "none";
        return differences;
      }
      
      // Normal case: Compare for modifications
      // Get all keys from both objects
      const allKeys = new Set([
        ...Object.keys(oldObj), 
        ...Object.keys(newObj)
      ]);
      
      // Check each key for differences
      allKeys.forEach(key => {
        // Case 1: Key exists in both objects but values are different
        if (key in oldObj && key in newObj && oldObj[key] !== newObj[key]) {
          differences.old[key] = oldObj[key];
          differences.new[key] = newObj[key];
        }
        // Case 2: Key exists only in oldObj
        else if (key in oldObj && !(key in newObj)) {
          differences.old[key] = oldObj[key];
        }
        // Case 3: Key exists only in newObj
        else if (!(key in oldObj) && key in newObj) {
          differences.new[key] = newObj[key];
        }
      });
      
      return differences;
    }
    
    useEffect(() => {
      const diff = findDifferences(oldData, newData);
      setDifferences(diff);
      if(differences.changeType === "none") return;
    }, [oldData, newData, differences.changeType]);
  
    const renderValue = (value: any) => {
      if (value === undefined || value === null) {
        return <span className="text-white/40">null</span>;
      }
      if (typeof value === 'object') {
        return <span className="font-mono text-sm">{JSON.stringify(value)}</span>;
      }
      return String(value);
    };
  
    return (
      <>
        <Button variant="light" onPress={onOpen} isIconOnly className="text-white hover:bg-white/10">
          <FaEllipsisVertical />
        </Button>
        <Modal 
          isOpen={isOpen} 
          size="3xl"
          onOpenChange={onOpenChange} 
          classNames={{
            base: "bg-modal_bg border rounded-lg border-white/20",
            header: "text-light_blue-500 border-b border-white/20",
            body: "pt-6",
            closeButton: "text-white/60 hover:text-white/80"
          }}
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {differences.changeType === "modified" && `Modified Data in table ${table_name}`}
                  {differences.changeType === "created" && `New Data created in table ${table_name}`}
                  {differences.changeType === "deleted" && `Data deleted in table ${table_name}`}
                </ModalHeader>
                <ModalBody  className="max-h-[500px] overflow-y-auto">
                  { differences.changeType === "created" ? (
                    <div className="space-y-4">
                      <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3 mb-4">
                        <p className="text-green-400">New data was created with the following values:</p>
                      </div>
                      {Object.keys(differences.new).map(key => (
                        <div key={key} className="border border-white/10 rounded p-3">
                          <div className="font-medium text-white mb-2">{key}</div>
                          <div className="bg-white/5 p-2 rounded break-all text-white">
                            {renderValue(differences.new[key])}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : differences.changeType === "deleted" ? (
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 mb-4">
                        <p className="text-red-400">The following data was deleted:</p>
                      </div>
                      {Object.keys(differences.old).map(key => (
                        <div key={key} className="border border-white/10 rounded p-3">
                          <div className="font-medium text-white mb-2">{key}</div>
                          <div className="bg-white/5 p-2 rounded break-all text-white">
                            {renderValue(differences.old[key])}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3 mb-4">
                        <p className="text-blue-400">The following values were modified:</p>
                      </div>
                      {Object.keys({...differences.old, ...differences.new}).map(key => (
                        <div key={key} className="border border-white/10 rounded p-3">
                          <div className="font-medium text-white mb-1">{key}</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-white/50 mb-1">Old Value:</div>
                              <div className="text-white/90 bg-white/5 p-2 rounded break-all">
                                {key in differences.old ? renderValue(differences.old[key]) : "-"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-white/50 mb-1">New Value:</div>
                              <div className="text-white/90 bg-white/5 p-2 rounded break-all">
                                {key in differences.new ? renderValue(differences.new[key]) : "-"}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button 
                    onPress={onClose}
                    className="bg-light_blue-500 text-dark_blue hover:bg-light_blue"
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    );
  }