import FilesDashboard from '@/components/dashboard/files/FilesDashboard';
import { FilesProvider } from '@/components/dashboard/files/contexts/FilesProvider'; // Import the provider

export default function FilesPage() {
    return (
        <FilesProvider>
            <FilesDashboard />
        </FilesProvider>
    );
}