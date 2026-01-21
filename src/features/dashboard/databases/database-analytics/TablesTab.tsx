import { IndexStat, RowCount, TableSizeStat } from "@/types/databaseAnalyticsTypes";

interface TablesTabProps {
  tableSizes: TableSizeStat[];
  rowCounts: RowCount[];
  indexStats: IndexStat[];
}

export default function TablesTab({ tableSizes, rowCounts, indexStats }: TablesTabProps) {
  return (
    <div className="space-y-6 mt-4 text-white">
      <h4 className="font-bold text-lg mb-2 text-light_blue-500">Tables</h4>
      <div className="overflow-x-auto rounded-xl border border-white/20">
        <table className="w-full">
          <thead className="bg-white/10">
            <tr>
              <th className="p-3 text-left">TABLE NAME</th>
              <th className="p-3 text-right">SIZE</th>
              <th className="p-3 text-right">ROWS</th>
              <th className="p-3 text-right">INDEXES</th>
            </tr>
          </thead>
          <tbody>
            {tableSizes.map((table) => {
              const rowCountItem = rowCounts.find((r) => r.table_name === table.name);
              const tableIndexes = indexStats.filter((i) => i.table_name === table.name);
              return (
                <tr key={table.name} className="border-t border-white/20 hover:bg-white/5">
                  <td className="p-3">{table.name}</td>
                  <td className="p-3 text-right">{table.sizeFormatted}</td>
                  <td className="p-3 text-right">
                    {rowCountItem ? rowCountItem.row_count.toLocaleString() : "N/A"}
                  </td>
                  <td className="p-3 text-right">{tableIndexes.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}