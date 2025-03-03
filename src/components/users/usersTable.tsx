"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Spinner,
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
  Input,
  Pagination,
  SortDescriptor,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from "@heroui/react";
import { useSession } from "next-auth/react";

// SearchIcon component
const SearchIcon = (props:any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

// FilterIcon component
const FilterIcon = (props:any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z"
      fill="currentColor"
    />
  </svg>
);

export type Worker = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  country: string;
  role: string;
};

export default function WorkersTable() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "lastName",
    direction: "ascending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Mock data for demonstration
  const mockWorkers: Worker[] = [
    { id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", phoneNumber: "+1-555-123-4567", country: "USA", role: "Developer" },
    { id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", phoneNumber: "+1-555-987-6543", country: "Canada", role: "Manager" },
    { id: "3", firstName: "Alice", lastName: "Johnson", email: "alice@example.com", phoneNumber: "+44-20-1234-5678", country: "UK", role: "Designer" },
    { id: "4", firstName: "Bob", lastName: "Brown", email: "bob.brown@example.com", phoneNumber: "+61-2-9876-5432", country: "Australia", role: "Developer" },
    { id: "5", firstName: "Carlos", lastName: "Rodriguez", email: "carlos@example.com", phoneNumber: "+34-91-123-4567", country: "Spain", role: "HR" },
    { id: "6", firstName: "Maria", lastName: "Garcia", email: "maria.g@example.com", phoneNumber: "+52-55-1234-5678", country: "Mexico", role: "Sales" },
    { id: "7", firstName: "Ahmed", lastName: "Hassan", email: "ahmed@example.com", phoneNumber: "+20-2-1234-5678", country: "Egypt", role: "Support" },
    { id: "8", firstName: "Yuki", lastName: "Tanaka", email: "yuki@example.com", phoneNumber: "+81-3-1234-5678", country: "Japan", role: "Developer" },
    { id: "9", firstName: "Elena", lastName: "Petrova", email: "elena@example.com", phoneNumber: "+7-495-123-4567", country: "Russia", role: "Manager" },
    { id: "10", firstName: "Hans", lastName: "Müller", email: "hans@example.com", phoneNumber: "+49-30-1234-5678", country: "Germany", role: "Finance" },
    { id: "11", firstName: "Sophie", lastName: "Martin", email: "sophie@example.com", phoneNumber: "+33-1-1234-5678", country: "France", role: "Marketing" },
    { id: "12", firstName: "Li", lastName: "Wei", email: "li.wei@example.com", phoneNumber: "+86-10-1234-5678", country: "China", role: "Product" },
  ];

  // Fetch workers from API (with a mock implementation for now)
  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    
    // Simulate API call with filtering, sorting, and pagination
    try {
      // This would be a real API call in production
      // const params = new URLSearchParams({
      //   page: currentPage.toString(),
      //   limit: rowsPerPage.toString(),
      //   search: searchText,
      //   country: countryFilter,
      //   role: roleFilter,
      //   sortColumn: sortDescriptor.column?.toString() || "",
      //   sortDirection: sortDescriptor.direction || ""
      // });
      // const response = await fetch(`/api/workers?${params.toString()}`);
      // const { data, count } = await response.json();
      
      // For now, we'll filter the mock data
      let filteredWorkers = [...mockWorkers];
      
      // Apply search filter
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.firstName.toLowerCase().includes(lowerSearch) ||
          worker.lastName.toLowerCase().includes(lowerSearch) ||
          worker.email.toLowerCase().includes(lowerSearch) ||
          worker.phoneNumber.includes(searchText) ||
          worker.country.toLowerCase().includes(lowerSearch) ||
          worker.role.toLowerCase().includes(lowerSearch)
        );
      }
      
      // Apply country filter
      if (countryFilter) {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.country === countryFilter
        );
      }
      
      // Apply role filter
      if (roleFilter) {
        filteredWorkers = filteredWorkers.filter(worker => 
          worker.role === roleFilter
        );
      }
      
      // Apply sorting
      if (sortDescriptor.column) {
        filteredWorkers.sort((a, b) => {
          const aValue = a[sortDescriptor.column as keyof Worker];
          const bValue = b[sortDescriptor.column as keyof Worker];
          
          const compareResult = aValue.localeCompare(bValue);
          return sortDescriptor.direction === "ascending" ? compareResult : -compareResult;
        });
      }
      
      // Apply pagination
      const startIndex = (currentPage - 1) * rowsPerPage;
      const paginatedWorkers = filteredWorkers.slice(startIndex, startIndex + rowsPerPage);
      
      setWorkers(paginatedWorkers);
      setTotalCount(filteredWorkers.length);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, countryFilter, roleFilter, rowsPerPage, searchText, sortDescriptor]);

  // Fetch workers when dependencies change
  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  // Get unique countries and roles for filter dropdowns
  const countries = [...new Set(mockWorkers.map(worker => worker.country))];
  const roles = [...new Set(mockWorkers.map(worker => worker.role))];

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / rowsPerPage);

  // Top content: Search, filters, Rows per page
  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            isClearable
            placeholder="Search workers..."
            value={searchText}
            onClear={() => setSearchText("")}
            onValueChange={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
            className="flex-grow"
            startContent={<SearchIcon className="text-default-300" />}
            variant="bordered"
          />
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                startContent={<FilterIcon />}
                className="min-w-[120px]"
              >
                {countryFilter || "Country"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Country Filter"
              selectionMode="single"
              selectedKeys={countryFilter ? [countryFilter] : []}
              onSelectionChange={(keys: any) => {
                const selected = Array.from(keys)[0] as string;
                setCountryFilter(selected);
                setCurrentPage(1);
              }}
            >
              <DropdownItem key="">All Countries</DropdownItem>
              {countries.map((country) => (
                <DropdownItem key={country}>{country}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          
          <Dropdown>
            <DropdownTrigger>
              <Button 
                variant="bordered" 
                startContent={<FilterIcon />}
                className="min-w-[120px]"
              >
                {roleFilter || "Role"}
              </Button>
            </DropdownTrigger>
            <DropdownMenu 
              aria-label="Role Filter"
              selectionMode="single"
              selectedKeys={roleFilter ? [roleFilter] : []}
              onSelectionChange={(keys: any) => {
                const selected = Array.from(keys)[0] as string;
                setRoleFilter(selected);
                setCurrentPage(1);
              }}
            >
              <DropdownItem key="">All Roles</DropdownItem>
              {roles.map((role) => (
                <DropdownItem key={role}>{role}</DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">Total {totalCount} workers</span>
          <label className="flex items-center text-default-400 text-small">
            Rows per page:
            <select
              className="bg-transparent outline-none text-default-400 text-small ml-2"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </label>
        </div>
      </div>
    );
  }, [searchText, countryFilter, roleFilter, rowsPerPage, totalCount, countries, roles]);

  // Bottom content: Pagination
  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 px-2 flex justify-between items-center">
        <Pagination
          showControls
          classNames={{
            cursor: "bg-foreground text-background",
          }}
          color="default"
          page={currentPage}
          total={totalPages}
          variant="light"
          onChange={setCurrentPage}
        />
      </div>
    );
  }, [currentPage, totalPages]);

  return (
    <div className="bg-transparent min-h-screen w-full dark text-white">
      
      {loading && workers.length === 0 ? (
        <div className="w-full h-full flex justify-center items-center pt-32">
          <Spinner color="default" />
        </div>
      ) : (
        <Table
          aria-label="Workers Table"
          topContent={topContent}
          bottomContent={bottomContent}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          classNames={{
            base: "w-full",
            table: "w-full",
            thead: "rounded-none",
            tr: " hover:bg-white/5",
            th: "bg-white/10 text-default-500",
            td: "p-3 ",
            wrapper: "bg-white/5 rounded-lg",
          }}
        >
          <TableHeader>
            <TableColumn key="firstName" allowsSorting>First Name</TableColumn>
            <TableColumn key="lastName" allowsSorting>Last Name</TableColumn>
            <TableColumn key="email" allowsSorting>Email</TableColumn>
            <TableColumn key="phoneNumber" allowsSorting>Phone Number</TableColumn>
            <TableColumn key="country" allowsSorting>Country</TableColumn>
            <TableColumn key="role" allowsSorting>Role</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No workers found" items={workers}>
            {(worker) => (
              <TableRow key={worker.id}>
                <TableCell>{worker.firstName}</TableCell>
                <TableCell>{worker.lastName}</TableCell>
                <TableCell>{worker.email}</TableCell>
                <TableCell>{worker.phoneNumber}</TableCell>
                <TableCell>{worker.country}</TableCell>
                <TableCell>{worker.role}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}