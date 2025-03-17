import { TableRow, TableCell } from "@heroui/react";

interface AuditLogRowProps {
  log: any;
}

export const ProjectsTableRow = ({ log }: AuditLogRowProps) => {
  return (
    <TableRow key={log.id}>
      <TableCell>{log.id}</TableCell>
      <TableCell>{log.action}</TableCell>
      <TableCell>{log.date.toLocaleString()}</TableCell>
      <TableCell>
        {/* <DetailsModal
          action={log.action.toLowerCase()}
          table_name={log.table_name}
          oldData={log.old_data}
          newData={log.new_data}
        /> */}
        <div></div>
      </TableCell>
    </TableRow>
  );
};