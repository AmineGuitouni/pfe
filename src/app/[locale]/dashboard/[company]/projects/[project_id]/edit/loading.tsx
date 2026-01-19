import { Spinner } from "@heroui/react";

export default function EditProjectLoading() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <Spinner size="lg" color="primary" />
        </div>
    );
}
