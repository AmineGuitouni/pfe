import { supabase } from "@/lib/database/supabase";
export default function FormPage({ params: { company } }: { params: { company: string } }) {
    async function action(data: FormData) {
        "use server";
        const name = data.get('name');
        await supabase.from('data').insert({ name, company });
    }

    return (
        <form action={action}>
            <input name="name" type="text" />
            <button type="submit">Submit</button>
        </form>
    )
}