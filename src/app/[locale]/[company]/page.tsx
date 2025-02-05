export default function CompanyPage({ params: { company } }: {params: {company: string}}) {
    return (
        <div>
            <h1>Company {company}</h1>
        </div>
    );
}