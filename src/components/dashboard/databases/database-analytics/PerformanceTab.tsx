"use client";
import { formatBytes } from "@/lib/utils/formatBytes";
import { IndexStat, RecentQuery } from "@/types/databaseAnalyticsTypes";

interface PerformanceTabProps {
  indexStats: IndexStat[];
  recentQueries: RecentQuery[];
}

export default function PerformanceTab({ indexStats, recentQueries }: PerformanceTabProps) {
  return (
    <div className="space-y-6 mt-4 text-white">
      {/* Index Statistics Section */}
      <div>
        <h4 className="font-bold text-lg mb-2">Index Statistics</h4>
        <div className="overflow-x-auto rounded-xl border border-white/20">
          <table className="w-full">
            <thead className="bg-white/10">
              <tr>
                <th className="p-3 text-left">TABLE</th>
                <th className="p-3 text-left">INDEX NAME</th>
                <th className="p-3 text-right">SIZE</th>
                <th className="p-3 text-right">USAGE COUNT</th>
              </tr>
            </thead>
            <tbody>
              {indexStats.map((index, i) => (
                <tr key={i} className="border-t border-white/20 hover:bg-white/5">
                  <td className="p-3">{index.table_name}</td>
                  <td className="p-3">{index.index_name}</td>
                  <td className="p-3 text-right">{formatBytes(index.index_size || 0)}</td>
                  <td className="p-3 text-right">{index.usage_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Slow Queries Section (conditionally rendered) */}
      {recentQueries.length > 0 && (
        <div>
          <h4 className="font-bold text-lg mb-2">Recent Slow Queries</h4>
          <div className="overflow-x-auto rounded-xl border border-white/20">
            <table className="w-full">
              <thead className="bg-white/10">
                <tr>
                  <th className="p-3 text-left">QUERY</th>
                  <th className="p-3 text-right">DURATION (MS)</th>
                  <th className="p-3 text-right">EXECUTED AT</th>
                </tr>
              </thead>
              <tbody>
                {recentQueries.map((query, i) => (
                  <tr key={i} className="border-t border-white/20 hover:bg-white/5">
                    <td className="p-3">
                      <div className="max-w-md truncate">{query.query_text}</div>
                    </td>
                    <td className="p-3 text-right">{query.duration_ms.toFixed(2)}</td>
                    <td className="p-3 text-right">{new Date(query.executed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}