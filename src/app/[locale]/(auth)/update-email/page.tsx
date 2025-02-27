
import ResetMailContent from "@/components/dashboard/preferences/change_mail/resetMailContent";
import ResetMailLoading from "@/components/dashboard/preferences/change_mail/resetMailLoading";
import { Suspense } from "react";

export default function ResetPasswordPage({ searchParams: { token } }: { searchParams: { token?: string | null } }) {
    
    return (
        <main className="h-full w-full flex justify-center items-center p-4">
              <div className="max-w-md w-full">
                <Suspense fallback={<ResetMailLoading/>}>
                  <ResetMailContent token={token ?? null} />
                </Suspense>
              </div>
        </main>
    );
}