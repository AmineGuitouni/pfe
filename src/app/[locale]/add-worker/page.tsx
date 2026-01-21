
import AddUserContent from "@/features/users/addUserform/addUserContent";
import AddUserLoading from "@/features/users/addUserform/addUserLoading";
import { Suspense } from "react";

export default function ResetPasswordPage({ searchParams: { token } }: { searchParams: { token?: string | null } }) {
    
    return (
        <main className="h-full w-full flex justify-center items-center p-4">
              <div className="max-w-md w-full">
                <Suspense fallback={<AddUserLoading/>}>
                  <AddUserContent token={token ?? null} />
                </Suspense>
              </div>
        </main>
    );
}