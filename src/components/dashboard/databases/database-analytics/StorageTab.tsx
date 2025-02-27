import { BucketSizeStat } from "@/types/databaseAnalyticsTypes";

interface StorageTabProps {
  bucketSizes: BucketSizeStat[];
}

export default function StorageTab({ bucketSizes }: StorageTabProps) {
  return (
    <div className="space-y-6 mt-4 text-white">
      <h4 className="font-bold text-lg mb-2 text-light_blue-500">Storage</h4>
      <div className="overflow-x-auto rounded-xl border border-white/20">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">BUCKET NAME</th>
              <th className="p-3 text-right">SIZE</th>
            </tr>
          </thead>
          <tbody>
            {bucketSizes.map((bucket) => (
              <tr key={bucket.name} className="border-t border-white/20 hover:bg-white/5">
                <td className="p-3">{bucket.name}</td>
                <td className="p-3 text-right">{bucket.sizeFormatted}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}