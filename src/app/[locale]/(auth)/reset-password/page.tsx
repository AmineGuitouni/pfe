import ResetPasswordContent from "@/components/auth/reset-password/resetContent";
import ForgotPasswordLoading from "@/components/auth/reset-password/verificationLoading";
import { Suspense } from "react";

export default function ResetPasswordPage({ searchParams: { token } }: { searchParams: { token?: string | null } }) {
    
    return (
        <main className="h-full w-full flex justify-center items-center p-4">
              <div className="max-w-md w-full">
                <Suspense fallback={<ForgotPasswordLoading/>}>
                  <ResetPasswordContent token={token ?? null} />
                </Suspense>
              </div>
        </main>
    );
}