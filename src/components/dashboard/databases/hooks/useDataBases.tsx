import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Database } from "@/app/api/v1/[user_id]/databases/list/route";

export default function useDataBases() {
    const [databases, setDatabases] = useState<Database[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session } = useSession();

    console.log(databases)

    useEffect(() => {
        if (session?.user?.id) {
            fetchDatabases(session.user.id);
        } else {
            setDatabases([]);
            setIsLoading(false);
        }
    }, [session]);

    const fetchDatabases = async (userId: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/v1/${userId}/databases/list`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const {data} = await response.json();
            console.log("data", data);
            setDatabases(data || []);
        } catch (e: any) {
            setError(e.message);
            setDatabases([]);
        } finally {
            setIsLoading(false);
        }
    };

    const addDatabase = async (database: Omit<Database, 'id' | 'created_at'>) => {
        if (!session?.user?.id) {
            setError("User not authenticated");
            return;
        }
    
        try {
            const response = await fetch(`/api/v1/${session.user.id}/databases/new`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(database),
            });
    
            if (!response.ok) {
                setError("Failed to add database");
                return;
            }
            const {data} = await response.json()
      
            const newDatabase:Database = {
                id:data.id,
                name: database.name,
                connection_config: {
                NEXT_PUBLIC_SUPABASE_URL: database.connection_config.NEXT_PUBLIC_SUPABASE_URL,
                SUPABASE_KEY: database.connection_config.SUPABASE_KEY,
                NEXT_PUBLIC_SUPABASE_ANON_KEY: database.connection_config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                SUPABASE_JWT_SECRET: database.connection_config.SUPABASE_JWT_SECRET,
                },
                created_at: new Date().toISOString(),
            };

            setDatabases((prevDatabases) => [...prevDatabases, newDatabase]);
            return response;
        } catch (error) {
            console.log(error)
            setError("Failed to add database");
        }
    };

    const editDatabase = async (databaseId: string, updatedDatabase: Omit<Database, 'id' | 'created_at'>) => {
        if (!session?.user?.id) {
            setError("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`/api/v1/${session.user.id}/databases/${databaseId}/edit`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedDatabase),
            });

            if (!response.ok) {
                setError("Failed to edit database");
                return;
            }
            const editedDatabase: Database = {
                id: databaseId,
                name: updatedDatabase.name,
                connection_config: {
                    NEXT_PUBLIC_SUPABASE_URL: updatedDatabase.connection_config.NEXT_PUBLIC_SUPABASE_URL,
                    SUPABASE_KEY: updatedDatabase.connection_config.SUPABASE_KEY,
                    NEXT_PUBLIC_SUPABASE_ANON_KEY: updatedDatabase.connection_config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    SUPABASE_JWT_SECRET: updatedDatabase.connection_config.SUPABASE_JWT_SECRET,
                },
                created_at: new Date().toISOString(),
            }

            setDatabases(prevDatabases =>
                prevDatabases.map(db => (db.id === databaseId ? editedDatabase : db))
            );
            return response;
        } catch (error) {
            console.log(error)
            setError("Failed to edit database");
        }
    };

    const deleteDatabase = async (databaseId: string) => {
        if (!session?.user?.id) {
            setError("User not authenticated");
            return;
        }

        try {
            const response = await fetch(`/api/v1/${session.user.id}/databases/${databaseId}/delete`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.error || "Failed to delete database";
                setError("Internal Server Error: " + errorMessage);
                return false;
            }

            setDatabases(prevDatabases => prevDatabases.filter(db => db.id !== databaseId));
            return true;
        } catch (error) {
            console.log(error)
            setError("Network error. Please check your connection.");
            return false;
        }
    };

    return {
        databases,
        isLoading,
        error,
        setDatabases,
        addDatabase,
        deleteDatabase,
        editDatabase
    };
};