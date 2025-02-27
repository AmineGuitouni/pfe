"use client"
import React, { useState, useCallback, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
  Pagination,
} from "@heroui/react";
import { FiPlus, FiSearch, FiChevronDown } from "react-icons/fi";

interface Group {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  members: number;
  status: "active" | "inactive" | "archived";
  accessLevel: "low" | "medium" | "high";
  lastModified: string;
}

type ColumnKey = keyof Group | "actions";

const columns = [
  { name: "Group Name", uid: "name", sortable: true },
  { name: "Description", uid: "description" },
  { name: "Members", uid: "members", sortable: true },
  { name: "Access Level", uid: "accessLevel", sortable: true },
  { name: "Actions", uid: "actions" },
];

const statusOptions = [
  { name: "Active", uid: "active" },
  { name: "Inactive", uid: "inactive" },
  { name: "Archived", uid: "archived" },
];

const accessLevelColorMap = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const groupsData: Group[] = [
  {
    id: 1,
    name: "Administrators",
    description: "Full system access",
    permissions: ["full_access", "user_management", "system_settings"],
    members: 3,
    status: "active",
    accessLevel: "high",
    lastModified: "2025-02-15",
  },
  {
    id: 2,
    name: "Content Editors",
    description: "Content management access",
    permissions: ["create_content", "edit_content", "delete_content"],
    members: 8,
    status: "active",
    accessLevel: "medium",
    lastModified: "2025-02-10",
  },
  {
    id: 3,
    name: "Viewers",
    description: "Read-only access",
    permissions: ["view_content", "view_dashboard"],
    members: 15,
    status: "active",
    accessLevel: "low",
    lastModified: "2025-01-28",
  },
  {
    id: 4,
    name: "Support Team",
    description: "Customer support access",
    permissions: ["view_tickets", "edit_tickets", "create_tickets"],
    members: 6,
    status: "active",
    accessLevel: "medium",
    lastModified: "2025-02-05",
  },
  {
    id: 5,
    name: "Finance Team",
    description: "Financial data access",
    permissions: ["view_finance", "export_reports"],
    members: 4,
    status: "active",
    accessLevel: "medium",
    lastModified: "2025-02-12",
  }
];

interface GroupsTableProps {
  groups?: Group[];
  onEdit?: (group: Group) => void;
  onView?: (group: Group) => void;
  onDelete?: (group: Group) => void;
  onCreateGroup?: () => void;
}

export default function GroupsTable({ 
  groups = groupsData,
  onEdit,
  onView,
  onDelete,
  onCreateGroup,
}: GroupsTableProps) {
  const [filterValue, setFilterValue] = useState("");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set([]));
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(["active", "inactive", "archived"]));
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [sortDescriptor, setSortDescriptor] = useState({
    column: "name",
    direction: "ascending",
  });
  const [page, setPage] = useState(1);

  const filteredItems = useMemo(() => {
    let filteredGroups = [...groups];

    if (filterValue.trim()) {
      filteredGroups = filteredGroups.filter((group) => 
        group.name.toLowerCase().includes(filterValue.toLowerCase()) ||
        group.description.toLowerCase().includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter.size > 0 && statusFilter.size < statusOptions.length) {
      filteredGroups = filteredGroups.filter((group) => 
        Array.from(statusFilter).includes(group.status)
      );
    }

    return filteredGroups;
  }, [groups, filterValue, statusFilter]);

  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof Group];
      const second = b[sortDescriptor.column as keyof Group];
      
      if (typeof first === "string" && typeof second === "string") {
        return sortDescriptor.direction === "ascending" 
          ? first.localeCompare(second)
          : second.localeCompare(first);
      }
      
      if (typeof first === "number" && typeof second === "number") {
        return sortDescriptor.direction === "ascending" 
          ? first - second
          : second - first;
      }
      
      return 0;
    });
    
    return sorted;
  }, [filteredItems, sortDescriptor]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedItems.slice(start, end);
  }, [page, sortedItems, rowsPerPage]);

  const pages = Math.ceil(sortedItems.length / rowsPerPage);
  // const hasSearchFilter = Boolean(filterValue);

  const renderCell = useCallback((group: Group, columnKey: ColumnKey) => {
    const cellValue = group[columnKey as keyof Group];

    switch (columnKey) {
      case "name":
        return (
          <div className="flex flex-col">
            <p className="font-medium">{cellValue as string}</p>
          </div>
        );
      case "description":
        return <p>{cellValue as string}</p>;
      case "members":
        return <p>{cellValue as number}</p>;
      case "accessLevel":
        return (
          <Chip
            className="capitalize"
            color={accessLevelColorMap[group.accessLevel] as any}
            size="sm"
            variant="flat"
          >
            {cellValue as string}
          </Chip>
        );
      case "actions":
        return (
          <div className="flex justify-end items-center gap-2">
            <Button isIconOnly size="sm" variant="light" onClick={() => onEdit?.(group)}>
              ✏️
            </Button>
            <Button isIconOnly size="sm" variant="light" onClick={() => onView?.(group)}>
              👁️
            </Button>
            <Button isIconOnly size="sm" variant="light" onClick={() => onDelete?.(group)}>
              ❌
            </Button>
          </div>
        );
      default:
        return cellValue;
    }
  }, [onEdit, onView, onDelete]);

  const onRowsPerPageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setPage(1);
  }, []);

  const onSearchChange = useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
      setPage(1);
    } else {
      setFilterValue("");
    }
  }, []);

  const topContent = useMemo(() => (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between gap-3 items-end">
        <Input
          isClearable
          className="w-full sm:max-w-[44%]"
          placeholder="Search groups..."
          size="sm"
          startContent={<FiSearch />}
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={onSearchChange}
        />
        <div className="flex gap-3">
          <Dropdown>
            <DropdownTrigger className="hidden sm:flex">
              <Button
                endContent={<FiChevronDown className="text-small" />}
                size="sm"
                variant="flat"
              >
                Filter
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              disallowEmptySelection
              aria-label="Filter Options"
              closeOnSelect={false}
              selectedKeys={statusFilter}
              selectionMode="multiple"
              onSelectionChange={setStatusFilter as any}
            >
              {statusOptions.map((status) => (
                <DropdownItem key={status.uid} className="capitalize">
                  {status.name}
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <Button
            color="primary"
            endContent={<FiPlus />}
            size="sm"
            onClick={onCreateGroup}
          >
            Create Group
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-small text-default-400">
          Total {filteredItems.length} groups
        </span>
        <label className="flex items-center text-small">
          Rows per page:
          <select
            className="bg-transparent outline-none text-small ml-2"
            onChange={onRowsPerPageChange}
            defaultValue="5"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
          </select>
        </label>
      </div>
    </div>
  ), [filterValue, onSearchChange, statusFilter, onRowsPerPageChange, filteredItems.length, onCreateGroup]);

  const bottomContent = useMemo(() => (
    <div className="py-2 px-2 flex justify-between items-center">
      <span className="text-small text-default-400">
        {selectedKeys.size > 0 
          ? `${selectedKeys.size} of ${filteredItems.length} selected`
          : `Showing ${paginatedItems.length} of ${filteredItems.length} entries`}
      </span>
      <Pagination
        showControls
        color="primary"
        isDisabled={pages <= 1}
        page={page}
        total={pages}
        variant="light"
        onChange={setPage}
      />
    </div>
  ), [page, pages, selectedKeys, filteredItems.length, paginatedItems.length]);

  return (
    <div className="w-full">
      <Table
        aria-label="Groups table"
        bottomContent={bottomContent}
        bottomContentPlacement="outside"
        classNames={{
          wrapper: "shadow-md rounded-lg",
        }}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        sortDescriptor={sortDescriptor as any}
        topContent={topContent}
        topContentPlacement="outside"
        onSelectionChange={setSelectedKeys as any}
        onSortChange={setSortDescriptor as any}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.uid}
              align={column.uid === "actions" ? "end" : "start"}
              allowsSorting={column.sortable}
            >
              {column.name}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent={"No groups found"} items={paginatedItems}>
          {(item) => (
            <TableRow key={item.id}>
              {(columnKey) => <TableCell>{renderCell(item, columnKey as ColumnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}