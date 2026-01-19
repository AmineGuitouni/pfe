import Companies from "@/components/dashboard/companies/companies";


export default function Page() {
    return (
        <div className="w-full h-full overflow-y-auto scrollbar-custom flex flex-col gap-5 p-10">
            <Companies/>
        </div>
    );
}