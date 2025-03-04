import { useCallback, useEffect, useState } from "react";
import { Group } from "../types/groupsTypes";

const dummyData = [
    {
        id: "1",
        name: "Group A",
        description: "This is Group A",
        members_count: 10,
        created_at: "2023-01-01T00:00:00Z"
    },
    {
        id: "2",
        name: "Group B",
        description: "This is Group B",
        members_count: 15,
        created_at: "2023-01-02T00:00:00Z"
    },
    {
        id: "3",
        name: "Group C",
        description: "This is Group C",
        members_count: 20,
        created_at: "2023-01-03T00:00:00Z"
    },
    {
        id: "4",
        name: "Group D",
        description: "This is Group D",
        members_count: 25,
        created_at: "2023-01-04T00:00:00Z"
    },
    {
        id: "5",
        name: "Group E",
        description: "This is Group E",
        members_count: 30,
        created_at: "2023-01-05T00:00:00Z"
    },
    {
        id: "6",
        name: "Group F",
        description: "This is Group F",
        members_count: 35,
        created_at: "2023-01-06T00:00:00Z"
    },
    {
        id: "7",
        name: "Group G",
        description: "This is Group G",
        members_count: 40,
        created_at: "2023-01-07T00:00:00Z"
    },
    {
        id: "8",
        name: "Group H",
        description: "This is Group H",
        members_count: 45,
        created_at: "2023-01-08T00:00:00Z"
    },
    {
        id: "9",
        name: "Group I",
        description: "This is Group I",
        members_count: 50,
        created_at: "2023-01-09T00:00:00Z"
    },
    {
        id: "10",
        name: "Group J",
        description: "This is Group J",
        members_count: 55,
        created_at: "2023-01-10T00:00:00Z"
    },
    {
        id: "11",
        name: "Group K",
        description: "This is Group K",
        members_count: 60,
        created_at: "2023-01-11T00:00:00Z"
    },
    {
        id: "12",
        name: "Group L",
        description: "This is Group L",
        members_count: 65,
        created_at: "2023-01-12T00:00:00Z"
    },
    {
        id: "13",
        name: "Group M",
        description: "This is Group M",
        members_count: 70,
        created_at: "2023-01-13T00:00:00Z"
    },
    {
        id: "14",
        name: "Group N",
        description: "This is Group N",
        members_count: 75,
        created_at: "2023-01-14T00:00:00Z"
    },
    {
        id: "15",
        name: "Group O",
        description: "This is Group O",
        members_count: 80,
        created_at: "2023-01-15T00:00:00Z"
    },
    {
        id: "16",
        name: "Group P",
        description: "This is Group P",
        members_count: 85,
        created_at: "2023-01-16T00:00:00Z"
    },
    {
        id: "17",
        name: "Group Q",
        description: "This is Group Q",
        members_count: 90,
        created_at: "2023-01-17T00:00:00Z"
    },
    {
        id: "18",
        name: "Group R",
        description: "This is Group R",
        members_count: 95,
        created_at: "2023-01-18T00:00:00Z"
    },
    {
        id: "19",
        name: "Group S",
        description: "This is Group S",
        members_count: 100,
        created_at: "2023-01-19T00:00:00Z"
    },
    {
        id: "20",
        name: "Group T",
        description: "This is Group T",
        members_count: 105,
        created_at: "2023-01-20T00:00:00Z"
    }
]


export default function useGroups() {
    const [groups, setGroups] = useState<Group[]>(dummyData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {

    },[])

    useEffect(() => {
        fetchGroups();
    },[fetchGroups])

    const addGroup = useCallback(() => {
        
    },[])

    return {groups, loading, error, addGroup};
}