"use client"
import React, { useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";

interface EditDataBaseModalProps {
  database: Database;
  onOpenChange?: () => void;
  isOpen: boolean;
  editDatabase?: (databaseId: string, updatedDatabase: Omit<Database, "id" | "created_at">) => Promise<Response | undefined>
}

export default function EditDataBaseModal({ database, onOpenChange, isOpen, editDatabase }: EditDataBaseModalProps) {
  const [formData, setFormData] = useState({
    name: database.name,
    supabaseUrl: database.connection_config.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: database.connection_config.SUPABASE_KEY,
    jwtSecret: database.connection_config.SUPABASE_JWT_SECRET,
    supabaseAnonKey: database.connection_config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  const [error, setError] = useState("");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const validateInput = () => {
    if (!formData.name.trim()) {
      setError("Database name is required.");
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
      const response = await fetch(`/api/v1/${session.user.id}/databases/${database.id}/edit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          connection_config: {
            NEXT_PUBLIC_SUPABASE_URL: formData.supabaseUrl,
            SUPABASE_KEY: formData.supabaseKey,
            NEXT_PUBLIC_SUPABASE_ANON_KEY: formData.supabaseAnonKey,
            SUPABASE_JWT_SECRET: formData.jwtSecret,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData?.error || "Failed to update database";

        setError("Internal Server Error: " + errorMessage);
        return;
      }

      if(!editDatabase) return
      
      await editDatabase(database.id, {
        name: formData.name,
        connection_config: {
          NEXT_PUBLIC_SUPABASE_URL: formData.supabaseUrl,
          SUPABASE_KEY: formData.supabaseKey,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: formData.supabaseAnonKey,
          SUPABASE_JWT_SECRET: formData.jwtSecret,
        },
      });

      onOpenChange?.();
      setFormData({
        name: "",
        jwtSecret: "",
        supabaseAnonKey: "",
        supabaseKey: "",
        supabaseUrl: "",
      });
    } catch (err) {
      console.log(err)
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        className="dark"
        size="3xl"
        classNames={{
          base: "bg-[#212c30] border rounded-lg border-white/10",
          header: "text-[#7dd5de] border-b border-white/10",
          body: "pt-6",
          // footer: "border-t border-white/10",
          closeButton: "text-white/60 hover:text-white/80"
        }}
      >
        <ModalContent>
          {(onClose) => (
            <form onSubmit={handleSubmit}>
              <ModalHeader>Edit Database Connection</ModalHeader>
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

                <div className="flex gap-4">
                  <Input
                    label="Supabase URL"
                    value={formData.supabaseUrl}
                    onValueChange={(value) => setFormData({...formData, supabaseUrl: value})}
                    placeholder="e.g. https://db.supabase.co"
                    isRequired
                    classNames={{
                      label: "text-white/60",
                      input: "text-white bg-[#081e25]",
                      inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                    }}
                  />

                  <Input
                    label="Supabase Anon Key"
                    value={formData.supabaseAnonKey}
                    onValueChange={(value) => setFormData({...formData, supabaseAnonKey: value})}
                    type="text"
                    isRequired
                    classNames={{
                      label: "text-white/60",
                      input: "text-white bg-[#081e25]",
                      inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                    }}
                  />
                </div>

                <div className="flex gap-4">
                  <Input
                    label="Supabase Secret Key"
                    value={formData.supabaseKey}
                    onValueChange={(value) => setFormData({...formData, supabaseKey: value})}
                    type="password"
                    isRequired
                    classNames={{
                      label: "text-white/60",
                      input: "text-white bg-[#081e25]",
                      inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                    }}
                  />

                  <Input
                    label="Supabase JWT Key"
                    value={formData.jwtSecret}
                    onValueChange={(value) => setFormData({...formData, jwtSecret: value})}
                    type="password"
                    isRequired
                    classNames={{
                      label: "text-white/60",
                      input: "text-white bg-[#081e25]",
                      inputWrapper: "bg-[#081e25] border-white/10 hover:border-[#7dd5de] group-focus:border-[#7dd5de]"
                    }}
                  />
                </div>

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
                  className="bg-[#7dd5de] text-[#081e25] hover:bg-[#8ab0e0] transition-colors"
                  isLoading={loading}
                >
                  Update Database
                </Button>
              </ModalFooter>
            </form>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
