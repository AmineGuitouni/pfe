export type TableSize = {
    table_name: string;
    size_bytes: number;
};

export type BucketSize = {
    bucket_name: string;
    size_bytes: number;
};

export type RowCount = {
    table_name: string;
    row_count: number;
};

export type IndexStat = {
    table_name: string;
    index_name: string;
    index_size: number;
    usage_count: number;
};

export type RecentQuery = {
    query_text: string;
    duration_ms: number;
    executed_at: string;
};

export type TableSizeStat = {
    name: string;
    size: number;
    sizeFormatted: string;
};

export type BucketSizeStat = {
    name: string;
    size: number;
    sizeFormatted: string;
};

export interface DbStats {
    totalSize: number;
    tableCount: number;
    tableSizes: TableSizeStat[];
    totalBucketsSize: number;
    bucketSizes: BucketSizeStat[];
    rowCounts: RowCount[];
    indexStats: IndexStat[];
    recentQueries: RecentQuery[];
}
