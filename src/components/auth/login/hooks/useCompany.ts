import { useEffect, useState } from "react";

export type company = {
    id: string,
    name: string,
    user_id: string,
    created_at: string
}

export default function useCompany() {
    const [companys, setCompanys] = useState<company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>("");

    useEffect(()=>{
        setLoading(true);

        const originUrl = window.location.origin
        fetch(`${originUrl}/api/v1/companys/list?filter=${filter}`)
        .then(res => res.json())
        .then((data:{data:company[], error?:string}) => {
            console.log(data)
            if(data.error){
                setError(data.error)
            }
            setCompanys(data.data);
        })
        .catch((err) => {
            console.log(err)
            setCompanys([]);
            setError(err.message);
        })
        .finally(() => {
            setLoading(false);
        })
    },[filter])

    return {companys, loading, error, setFilter, filter}
}