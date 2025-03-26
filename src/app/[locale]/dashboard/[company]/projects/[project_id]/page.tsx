interface Params {
    company: string
    project_id: string
}

export default function ProjectPage({ params: { project_id } }: {params: Params}) {
    
    return (
        <div>
            <h1>Project {project_id}</h1>
        </div>
    );
}