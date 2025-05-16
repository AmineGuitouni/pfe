import { PanelRightOpen } from "lucide-react";

export default function HistoryModal() {
    return (
        <button
            // onClick={toggleHistorySidebar}
            className="p-2 rounded-md text-light_blue hover:bg-light_blue-500/20 transition-colors"
            title="Toggle History Sidebar"
        >
            <PanelRightOpen size={18} />
        </button>
    )
}