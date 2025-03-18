import { TableRow, TableCell } from "@heroui/react";
import { Project } from "../../types";
import { formatShortDate } from "@/lib/utils";

interface AuditLogRowProps {
  project: Project;
}

export const ProjectsTableRow = ({ project }: AuditLogRowProps) => {
  return (
    <TableRow key={project.id}>
      <TableCell>{project.name}</TableCell>
      <TableCell>{project.description}</TableCell>
      <TableCell>{project.tasks_count}</TableCell>
      <TableCell>{project.deadline || "No deadline"}</TableCell>
      <TableCell>{formatShortDate(project.created_at)}</TableCell>
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