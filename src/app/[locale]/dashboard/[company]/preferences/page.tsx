import AccountInformation from "@/components/dashboard/preferences/accountInformation";
import CvEditSection from "@/components/dashboard/preferences/change_cv/components/cvEditSection";
import ProfileInformation from "@/components/dashboard/preferences/profileInformation";

export default function PreferencesPage() {
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
                <h1 className="text-2xl text-white">User Preferences</h1>
                <p className="text-white/60 text-sm mb-6">Manage your profile, account settings, and preferences for your DigiGrowing experience.</p>

                <section className="border-1 border-white/20 rounded-lg bg-white/10 mb-8">
                    <h2 className="text-white text-xl mx-4 my-2">Account Information</h2>
                    <hr className="w-full border-white/20"/>
                    <AccountInformation className="p-4 w-full"/>
                </section>

                <section className="border-1 border-white/20 rounded-lg bg-white/5 mb-8">
                    <h2 className="text-white text-xl mx-4 my-2">Profile Information</h2>
                    <hr className="w-full border-white/20"/>
                    <ProfileInformation className="p-4 w-full"/>
                </section>

                <section className="border-1 border-white/20 rounded-lg bg-white/5 mb-8">
                    <h2 className="text-white text-xl mx-4 my-2">CV informations</h2>
                    <hr className="w-full border-white/20"/>
                    <div className="p-4 w-full">
                        <CvEditSection/>
                    </div>
                </section>
            </div>
        </div>
    )
}