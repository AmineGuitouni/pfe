import { IndexStat, RowCount, TableSizeStat } from "@/types/databaseAnalyticsTypes";

interface TablesTabProps {
    tableSizes: TableSizeStat[];
    rowCounts: RowCount[];
    indexStats: IndexStat[];
}
  
  export default function TablesTab({ tableSizes, rowCounts, indexStats }: TablesTabProps) {
    return (
      <div>
        <h2>Tables</h2>
        {tableSizes.map(table => {
          const rowCountItem = rowCounts.find(r => r.table_name === table.name);
          const tableIndexes = indexStats.filter(i => i.table_name === table.name);
          return (
            <div key={table.name}>
              <h3>{table.name}</h3>
              <p>Size: {table.sizeFormatted}</p>
              <p>Rows: {rowCountItem ? rowCountItem.row_count.toLocaleString() : 'N/A'}</p>
              <p>Indexes: {tableIndexes.length}</p>
            </div>
          );
        })}
      </div>
    );
  }