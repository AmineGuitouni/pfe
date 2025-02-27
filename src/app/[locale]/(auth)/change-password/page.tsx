import ChangePasswordContent from "@/components/dashboard/preferences/change-password/changePasswordContent";
import ChangePasswordLoading from "@/components/dashboard/preferences/change-password/changePasswordLoading";
import { Suspense } from "react";

export default function ResetPasswordPage({ searchParams: { token } }: { searchParams: { token?: string | null } }) {

    if(!token) return
    
    return (
        <main className="h-full w-full flex justify-center items-center p-4">
              <div className="max-w-md w-full">
                <Suspense fallback={<ChangePasswordLoading/>}>
                  <ChangePasswordContent token={token ?? null} />
                </Suspense>
              </div>
        </main>
    );
}