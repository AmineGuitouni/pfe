import { TableRow, TableCell, Dropdown, DropdownMenu, DropdownItem, DropdownTrigger, Button } from "@heroui/react";
import { Project } from "../../types";
import { formatShortDate } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

interface AuditLogRowProps {
  project: Project;
}

export const ProjectsTableRow = ({ project }: AuditLogRowProps) => {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <TableRow key={project.id}>
      <TableCell>{project.name}</TableCell>
      <TableCell>{project.description}</TableCell>
      <TableCell>{project.tasks_count}</TableCell>
      <TableCell>{project.deadline || "No deadline"}</TableCell>
      <TableCell>{formatShortDate(project.created_at)}</TableCell>
      <TableCell>
        <Dropdown>
          <DropdownTrigger>
            <Button variant="bordered">Open Menu</Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Dynamic Actions">
            <DropdownItem
              key="view"
              onPress={()=>{
                router.push(`${pathName}/${project.id}/assign-workers`)
              }}
            >
              View
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </TableCell>
    </TableRow>
  );
};