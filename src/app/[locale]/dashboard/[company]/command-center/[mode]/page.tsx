export default function CommandCenterPage({ params: { mode } }: { params: { mode: string } }) {
    return (
        <div className="w-full p-8">
            <div className="max-w-4xl mx-auto">
                {mode === 'cli' ? (
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-bold text-light_blue mb-2 animate-fade-in">
                            Command Line Interface
                        </h1>
                        <div className="w-20 h-1 bg-light_blue-500 mb-4"></div>
                        <p className="text-white text-lg max-w-2xl leading-relaxed text-center mt-4">
                            Direct system control through commands. <br />
                            <span className="text-light_blue-500">Type help</span> to see available commands.
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <h1 className="text-4xl font-bold text-light_blue mb-2 animate-fade-in">
                            AI Assistant
                        </h1>
                        <div className="w-20 h-1 bg-light_blue-500 mb-4"></div>
                        <p className="text-white text-lg max-w-2xl leading-relaxed text-center mt-4">
                            Natural language interface for system control. <br />
                            <span className="text-light_blue-500">Ask anything</span> to get assistance.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
