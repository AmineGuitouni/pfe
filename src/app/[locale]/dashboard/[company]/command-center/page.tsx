export default function CommandCenterPage({ params: { company } }: { params: { company: string } }) {
    return (
        <div className="w-full p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col items-center">
                    <h1 className="text-4xl font-bold text-light_blue mb-2 animate-fade-in">
                        Unified Command Center
                    </h1>
                    <div className="w-20 h-1 bg-light_blue-500 mb-4"></div>
                    <p className="text-white text-lg max-w-2xl leading-relaxed text-center mt-4">
                        Centralized control panel for managing all systems. <br />
                        <span className="text-light_blue-500">Execute commands</span> or <span className="text-light_blue-500">chat with AI</span> to streamline operations.
                    </p>
                </div>
            </div>
        </div>
    );
}
