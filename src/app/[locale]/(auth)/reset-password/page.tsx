export default function ResetPasswordPage({ searchParams: { token } }: { searchParams: { token?: string | null } }) {
    
    return (
        <main className="h-full w-full flex justify-center items-center p-4">
            <span className="text-white">
                token: {token}
            </span>
        </main>
    );
}