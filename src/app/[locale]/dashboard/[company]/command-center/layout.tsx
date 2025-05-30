import CommandInput from "@/components/dashboard/command-center/component/autoCompleate";
import HistoryModal from "@/components/dashboard/command-center/component/modals/HistoryModal";
import SwitchesButtons from "@/components/dashboard/command-center/component/switchesButtons";
import { CommandCenterProvider } from "@/components/dashboard/command-center/context/CommandCenterContext";


interface Params {
    company: string
}

interface LayoutProps { 
    children: React.ReactNode, 
    params: Params,
}
export default function Layout({ children, params }: LayoutProps) {

    return (
        <CommandCenterProvider>
            <div className="w-full h-full flex flex-col">
                <div className="p-4 border-b border-light_blue-500/20 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-light_blue">Command Center</h2>
                    <div className="flex items-center gap-2">
                        <SwitchesButtons comapny_id={params.company}/>
                        <HistoryModal />
                    </div>
                </div>
                <div className="h-[calc(100vh-117px)] flex flex-col">
                    {children}
                    <CommandInput/>
                </div>
            </div>
        </CommandCenterProvider>
    )
}