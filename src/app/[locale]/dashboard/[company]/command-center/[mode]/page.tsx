export default function CommandCenterPage({ params: { mode } }: { params: { mode: string } }) {
    return (
        <div className="w-full h-full text-white">
            test {mode}
        </div>
    );
}