"use client"
import { Alert, Input, Spinner } from "@heroui/react";
import DataBasesCard from "./dataBasesCard";
import { IoSearchOutline } from "react-icons/io5";
import { useState } from "react";
import AddDataBaseButton from "./AddDataBaseButton";
import useDataBases from "./hooks/useDataBases";

export default function DataBases() {
    const [searchTerm, setSearchTerm] = useState('');
    const { databases, isLoading, error } = useDataBases();

    const filteredDatabases = databases.filter(db =>
        db.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        db.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        db.rigion?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full flex flex-col gap-10">
            <div className="w-full flex gap-5">
                <AddDataBaseButton />
                <Input
                    placeholder="Search databases..."
                    size="sm"
                    className="w-[30%] dark text-white"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    endContent={<IoSearchOutline className="text-light_blue-500/70" />}
                    variant="bordered"
                />
            </div>

            {isLoading ? (
                <Spinner className=" absolute top-[50%] left-[57%]" color="default" />
            ) : error ? (
                <Alert variant="flat" color="danger" title="Error loading databases">
                    {error}
                </Alert>
            ) : !databases ? (
                <div className="text-white/50 text-center py-10">
                    No databases found. Create your first database connection.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {filteredDatabases.map(database => (
                        <DataBasesCard key={database.id} database={database} />
                    ))}
                </div>
            )}
        </div>
    );
}
