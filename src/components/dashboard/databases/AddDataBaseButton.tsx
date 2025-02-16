import React, { useState } from "react";
import { 
  Button, 
  Input,
  Modal, 
  ModalContent, 
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  useDisclosure
} from "@heroui/react";
import { useSession } from "next-auth/react";
import useDataBases from "./hooks/useDataBases";

export default function AddDatabaseButton() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [formData, setFormData] = useState({
    name: "",
    type: "postgres",
    region: "us-east-1",
    url: "",
    key: ""
  });
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const { addDatabase } = useDataBases();

  const validateInput = () => {
    if (!formData.name.trim()) {
      setError("Database name is required");
      return false;
    }
    if (!formData.url.includes("://")) {
      setError("Invalid connection URL");
      return false;
    }
    if (!formData.key) {
      setError("API key is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !validateInput()) return;

    setLoading(true);
    try {
      const response = await addDatabase({
        name: formData.name,
        type: formData.type,
        rigion: formData.region,
        connection_config: {
          NEXT_PUBLIC_SUPABASE_URL: formData.url,
          SUPABASE_KEY: formData.key,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: "...",
          SUPABASE_JWT_SECRET: "..."
        }
      });

      if (response.error) throw new Error(response.error);

      onOpenChange();
      setFormData({ name: "", type: "postgres", region: "us-east-1", url: "", key: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onPress={onOpen}
        size="sm"
        className="bg-[#7dd5de] text-[#081e25] font-semibold hover:bg-[#8ab0e0] transition-colors"
      >
        New Database
      </Button>

      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="dark"
        classNames={{
          base: "bg-[#212c30] border border-white/10",
          header: "text-[#7dd5de] border-b border-white/10",
          body: "py-6",
          footer: "border-t border-white/10",
          closeButton: "text-white/60 hover:text-white/80"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader>New Database Connection</ModalHeader>
              <ModalBody className="gap-6">
                <Input
                  label="Database Name"
                  value={formData.name}
                  onValueChange={(value) => setFormData({...formData, name: value})}
                  isRequired
                  classNames={{
                    label: "text-white/60",
                    input: "text-white bg-[#081e25]",
                    inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                  }}
                />

                <Select
                  label="Database Type"
                  selectedKeys={[formData.type]}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  classNames={{
                    label: "text-white/60",
                    trigger: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] text-white",
                    listbox: "bg-[#081e25] text-white"
                  }}
                >
                  <SelectItem key="Local" value="Local">Local</SelectItem>
                  <SelectItem key="Hosted" value="Hosted">Hosted</SelectItem>
                </Select>

                <Select
                  label="Region"
                  selectedKeys={[formData.region]}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  classNames={{
                    label: "text-white/60",
                    trigger: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] text-white",
                    listbox: "bg-[#081e25] text-white"
                  }}
                >
                  <SelectItem key="us-east-1">US East (N. Virginia)</SelectItem>
                  <SelectItem key="eu-west-1">EU (Ireland)</SelectItem>
                  <SelectItem key="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                </Select>

                <Input
                  label="Connection URL"
                  value={formData.url}
                  onValueChange={(value) => setFormData({...formData, url: value})}
                  placeholder="e.g. postgres://user:pass@host:port/dbname"
                  isRequired
                  classNames={{
                    label: "text-white/60",
                    input: "text-white bg-[#081e25]",
                    inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                  }}
                />

                <Input
                  label="API Key/Password"
                  value={formData.key}
                  onValueChange={(value) => setFormData({...formData, key: value})}
                  type="password"
                  isRequired
                  classNames={{
                    label: "text-white/60",
                    input: "text-white bg-[#081e25]",
                    inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                  }}
                />

                {error && (
                  <p className="text-red-500 text-sm">{error}</p>
                )}
              </ModalBody>
              
              <ModalFooter>
                <Button
                  variant="light"
                  onPress={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#7dd5de] text-[#081e25] font-semibold hover:bg-[#8ab0e0] transition-colors"
                  isLoading={loading}
                >
                  Create Database
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}