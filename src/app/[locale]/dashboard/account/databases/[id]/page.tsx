import { GetDatabaseResponse } from "@/app/api/v1/[user_id]/databases/[database_id]/get/route";
import PerformanceTab from "@/components/dashboard/databases/database-analytics/PerformanceTab";
import SizePieChart from "@/components/dashboard/databases/database-analytics/SizePieChart";
import StorageTab from "@/components/dashboard/databases/database-analytics/StorageTab";
import TablesTab from "@/components/dashboard/databases/database-analytics/TablesTab";
import { authOptions } from "@/lib/auth/authOptions";
import { formatBytes } from "@/lib/utils/formatBytes";
import { BucketSize, IndexStat, RecentQuery, RowCount, TableSize } from "@/types/databaseAnalyticsTypes";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { createClient, PostgrestError } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface dbInfoResponse {
    tableSizes: TableSize[];
    bucketSizes: BucketSize[];
    rowCounts: RowCount[];
    indexStats: IndexStat[];
    recentQueries: RecentQuery[]
}

async function dbInfo({ dburl, dbkey }: { dburl: string, dbkey: string }) {
    const supabaseClient = createClient(dburl, dbkey);

    const [
        { data: tableSizesData, error: tableSizesError },
        { data: bucketSizesData, error: bucketSizesError },
        { data: rowCountsData, error: rowCountsError },
        { data: indexStatsData, error: indexStatsError },
        { data: recentQueriesData, error: recentQueriesError }
    ] = await Promise.all([
        supabaseClient.rpc('get_table_sizes'),
        supabaseClient.rpc('get_storage_sizes'),
        supabaseClient.rpc('get_table_row_counts'),
        supabaseClient.rpc('get_index_stats'),
        supabaseClient.rpc('get_recent_queries')
    ]);

    if (tableSizesError) throw tableSizesError;
    if (bucketSizesError) throw bucketSizesError;
    if (rowCountsError) throw rowCountsError;
    if (indexStatsError) throw indexStatsError;
    if (recentQueriesError) throw recentQueriesError;

    return {
        tableSizes: tableSizesData,
        bucketSizes: bucketSizesData,
        rowCounts: rowCountsData,
        indexStats: indexStatsData,
        recentQueries: recentQueriesData
    } as dbInfoResponse;
}

export default async function DataBaseInfoPage({params:{id}}:{params:{id:string}}) {
    try{
        const headersList = headers();
        const host = headersList.get("host");
        const protocol = headersList.get("x-forwarded-proto") ?? "http";
        const origin = `${protocol}://${host}`;
        
        if(!origin){
            throw new Error("No origin")
        }

        const session = await getServerSession(authOptions)
        if(!session || !session.user){
            redirect("/login")
        }

        const response = await fetch(`${origin}/api/v1/${session.user.id}/databases/${id}/get`)
        if(!response.ok){
            throw new Error("Failed to get database")
        }

        const {data, error}:GetDatabaseResponse = await response.json()
        if(error){
            throw new Error(error)
        }
        console.log(data)
        if(!data){
            throw new Error("Database not found")
        }

        const dbStats = await dbInfo({dburl:data.connection_config.NEXT_PUBLIC_SUPABASE_URL, dbkey:data.connection_config.SUPABASE_KEY})

        const totalTableSize = dbStats.tableSizes.reduce((acc, tableSize) => acc + tableSize.size_bytes, 0);
        const totalBucketSize = dbStats.bucketSizes.reduce((acc, bucketSize) => acc + bucketSize.size_bytes, 0);
        return (
          <div className="w-full text-white">
            <div className="mx-auto w-full max-w-[1200px] py-6 px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28 space-y-4">
                <h1 className="font-bold text-2xl ">Database Analytics</h1>
                <div className="flex gap-4 justify-between mb-4 flex-wrap">
                    <Card className="bg-modal_bg border shadow-none flex-1 p-2 min-w-[400px] flex-shrink-0">
                        <CardHeader className="text-lg text-light_blue font-semibold">
                            Db Tables
                        </CardHeader>
                        <CardBody>
                        <div className="h-[250px] aspect-square">
                            <SizePieChart data={dbStats.tableSizes.map((table)=>({
                                name: table.table_name,
                                value: table.size_bytes
                            }))}/>  
                        </div>
                        </CardBody>
                        <CardFooter className="text-white">
                            Total DB Size: {formatBytes(totalTableSize)}
                        </CardFooter>
                    </Card>
                    <Card className="bg-modal_bg border shadow-none flex-1 p-2 min-w-[400px] flex-shrink-0">
                        <CardHeader className="text-lg text-light_blue font-semibold">
                            Storage
                        </CardHeader>
                        <CardBody>
                        <div className="h-[250px] aspect-square">
                            <SizePieChart data={dbStats.bucketSizes.map((table)=>({
                                name: table.bucket_name,
                                value: table.size_bytes
                            }))}/>  
                        </div>
                        </CardBody>
                        <CardFooter className="text-white">
                            Total Storage Size: {formatBytes(totalBucketSize)}
                        </CardFooter>
                    </Card>
                </div>
                <TablesTab
                tableSizes={dbStats.tableSizes.map((table) => ({
                    name: table.table_name,
                    size: table.size_bytes,
                    sizeFormatted: formatBytes(table.size_bytes),
                }))}
                rowCounts={dbStats.rowCounts}
                indexStats={dbStats.indexStats}
                />
                <StorageTab
                bucketSizes={dbStats.bucketSizes.map((bucket) => ({
                    name: bucket.bucket_name,
                    size: bucket.size_bytes,
                    sizeFormatted: formatBytes(bucket.size_bytes),
                }))}
                />
                <PerformanceTab
                indexStats={dbStats.indexStats}
                recentQueries={dbStats.recentQueries}
                />
            </div>
          </div>
        );
    }
    catch(error){
        console.log(error)
        if(error instanceof Error){
            return (
                <div className="text-white">
                    {error.message}
                </div>
            )
        }
        return (
            <div className="text-white">
                Internal server error
            </div>
        )
    }
}