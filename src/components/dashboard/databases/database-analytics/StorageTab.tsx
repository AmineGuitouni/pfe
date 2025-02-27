import { formatBytes } from "@/lib/utils/formatBytes";
import { BucketSizeStat } from "@/types/databaseAnalyticsTypes";

interface StorageTabProps {
    bucketSizes: BucketSizeStat[];
    totalBucketsSize: number;
  }
  
  export default function StorageTab({ bucketSizes, totalBucketsSize }: StorageTabProps) {
    return (
      <div>
        <h2>Storage</h2>
        <p>Total Size: {formatBytes(totalBucketsSize)}</p>
        {bucketSizes.map(bucket => (
          <div key={bucket.name}>
            <h3>{bucket.name}</h3>
            <p>Size: {bucket.sizeFormatted}</p>
          </div>
        ))}
      </div>
    );
  }