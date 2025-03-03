import UsersTable from "@/components/users/usersTable";

export default function UsersPage({ params: { company } }: {params: {company: string}}) {

    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
                <h1 className="text-2xl text-white">Team Directory</h1>
                <p className="text-white/60 text-sm mb-6">Your gateway to the people powering our company. Explore profiles, track contributions, and connect with the team driving innovation and success.</p>
                <UsersTable company_id={company}/>
            </div>
        </div>
    )
}