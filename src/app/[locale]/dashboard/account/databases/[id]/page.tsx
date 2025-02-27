import { GetDatabaseResponse } from "@/app/api/v1/[user_id]/databases/[database_id]/get/route";
import PerformanceTab from "@/components/dashboard/databases/database-analytics/PerformanceTab";
import StorageTab from "@/components/dashboard/databases/database-analytics/StorageTab";
import TablesTab from "@/components/dashboard/databases/database-analytics/TablesTab";
import { authOptions } from "@/lib/auth/authOptions";
import { formatBytes } from "@/lib/utils/formatBytes";
import { BucketSize, IndexStat, RecentQuery, RowCount, TableSize } from "@/types/databaseAnalyticsTypes";
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
          <div className="text-white w-full">
            <h1>Database Analytics</h1>
            <div>Total DB Size: {formatBytes(totalTableSize)}</div>
            <div>Total Storage Size: {formatBytes(totalBucketSize)}</div>
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
              totalBucketsSize={totalBucketSize}
            />
            <PerformanceTab
              indexStats={dbStats.indexStats}
              recentQueries={dbStats.recentQueries}
            />
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