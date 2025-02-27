import AuditLogsTable from "@/components/dashboard/audit-logs/auditLogsTable";

export default function AuditLogsPage() {
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
                <h1 className="text-2xl text-white">Activity History</h1>
                <p className="text-white/60 text-sm mb-6">Review your account activity and track actions you`ve taken within DigiGrowing.</p>
                <AuditLogsTable/>
            </div>
        </div>
    )
}