import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Database, DatabaseApiResponseBody } from "@/app/api/v1/[user_id]/databases/list/route";
import { DatabasePostRequestBody, DatabasePostResponseBody } from "@/app/api/v1/[user_id]/databases/new/route";

export default function useDataBases() {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user.id) return;

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchDatabases = async () => {
      setIsLoading(true);
      try {
        const originUrl = window.location.origin;
        const res = await fetch(
          `${originUrl}/api/v1/${session.user.id}/databases/list`,
          { signal }
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} - ${res.statusText}`);
        }

        const data: DatabaseApiResponseBody = await res.json();
        if (data.error) {
          console.error(data.error);
          setError(data.error);
        } else {
          setDatabases(data.data || []);
        }
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Fetch aborted");
        } else {
          console.error(err);
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDatabases();

    return () => {
      controller.abort();
    };
  }, [session?.user.id]);

  const addDatabase = useCallback(
    async (database: DatabasePostRequestBody): Promise<DatabasePostResponseBody> => {
      if (!session?.user.id) return { error: "Not logged in" };

      try {
        const originUrl = window.location.origin;
        const res = await fetch(
          `${originUrl}/api/v1/${session.user.id}/databases/new`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(database),
          }
        );

        if (!res.ok) {
          throw new Error(`Error: ${res.status} - ${res.statusText}`);
        }

        const data: DatabasePostResponseBody = await res.json();
        return data;
      } catch (error: any) {
        console.error(error);
        return { error: error.message };
      }
    },
    [session?.user.id]
  );

  return {
    databases,
    setDatabases,
    isLoading,
    error,
    addDatabase,
  };
}
