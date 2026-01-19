import MainAnalyticsComponent from "@/components/dashboard/analytics/components/mainAnalyticsComponent";

export default function AnalyticsPage({ params: { company} }: {params: {company: string}}) {
    return (
        <div className="flex flex-col w-full h-full overflow-y-auto scrollbar-custom p-10">
            <MainAnalyticsComponent company_id={company} />
        </div>
    );
}