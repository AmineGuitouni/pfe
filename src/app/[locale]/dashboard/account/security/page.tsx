import ChangePassword from "@/features/dashboard/preferences/changePassword";
import DeleteAccountButton from "@/features/dashboard/security/deleteAccountButton";
import { BiSolidErrorAlt } from "react-icons/bi";

export default function SecurityPage() {
    return (
        <div className="w-full">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 ">
                <h1 className="text-2xl text-white">Security Settings</h1>
                <p className="text-white/60 text-sm mb-6">
                Manage your security settings, update your password, and delete your account securely.
                </p>

                <section className="border-1 border-white/20 rounded-lg bg-white/5 mb-6">
                    <h2 className="text-white text-xl mx-4 my-2">Change password</h2>
                    <hr className="w-full border-white/20"/>
                    <ChangePassword className="p-4 w-full"/>
                </section>

                <section className="border-1 border-danger-500/50 rounded-lg bg-danger-500/5">
                    <h2 className="text-danger-500 text-xl mx-4 my-2">Danger Zone</h2>
                    <hr className="w-full border-danger-500/50"/>
                    <div className="flex">
                        <BiSolidErrorAlt className="text-danger-500 m-4" size={40}/>
                        <div className="my-4 mr-4">
                            <h1 className="text-lg text-white ">Request for account deletion</h1>
                            <p className="text-white/50 text-md ">
                            Deleting your account is permanent and cannot be undone. Your data will be deleted.
                            </p>
                            <DeleteAccountButton/>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    )
}