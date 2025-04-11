import FilesDashboard from '@/components/dashboard/files/FilesDashboard';
import { FilesProvider } from '@/components/dashboard/files/contexts/FilesProvider'; // Import the provider

export default function FilesPage({ params }: { params: { company: string } }) {
    return (
        <FilesProvider company_id={params.company}>
            <FilesDashboard />
        </FilesProvider>
    );
}