import { Suspense } from 'react';
import VerificationLoading from '@/components/verification/verificationLoading';
import VerificationContent from '@/components/verification/verificationContent';

export default function VerifyPage({ 
  searchParams: { token } 
}: { 
  searchParams: { token?: string | null } 
}) {
  return (
    <main className="h-full w-full flex justify-center items-center p-4">
      <div className="max-w-md w-full">
        <Suspense fallback={<VerificationLoading />}>
          <VerificationContent token={token ?? null} />
        </Suspense>
      </div>
    </main>
  );
}