"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useUsers } from '@/features/users/hooks/useUsers';
import { User } from '@/features/users/types/types';

// Simple SVG Icons (replace with your icon library if available)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-light_blue/80">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

const ClearIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);


interface UserSelectorProps {
  company_id: string;
  selectedUserId: string | null;
  onUserSelect?: (userId: string | null) => void;
  className?: string;
}

export default function UserSelector({ company_id, selectedUserId, onUserSelect, className }: UserSelectorProps) {
  const { users, searchText, setSearchText, loading } = useUsers(company_id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Ref for the input

  // Helper function to get display name
  const getUserDisplayName = (user: User | undefined): string => {
    if (!user) return "Select a user";
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.email; // Fallback to email if no name
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  // Close dropdown on click outside, ignore clicks inside input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && inputRef.current) {
      // Timeout ensures the input is rendered before focusing
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isDropdownOpen]);


  const handleSelect = (userId: string | null) => {
    onUserSelect?.(userId);
    setIsDropdownOpen(false);
    // Optionally clear search text after selection
    // setSearchText("");
  };

  return (
    // Removed gap-2, only one main element now
    <div className={`relative ${className} min-w-64`} ref={dropdownRef}>
      {/* Custom Select Button */}
      <div>
         <label htmlFor="user-select-button" className="block text-sm font-medium text-light_blue mb-1">
          Select User
        </label>
        <button
          type="button"
          id="user-select-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="relative w-full cursor-default rounded-md bg-modal_bg py-2 pl-3 pr-10 text-left text-white shadow-sm border border-light_blue-500/20 focus:outline-none focus:ring-1 focus:ring-light_blue-500 sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
        >
          <span className={`block truncate ${selectedUserId ? 'text-white' : 'text-gray-400'}`}>
            {getUserDisplayName(selectedUser)}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon />
          </span>
        </button>
      </div>

      {/* Dropdown List with Search Input */}
      {isDropdownOpen && (
        <ul
          className="absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md bg-modal_bg py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          role="listbox"
        >
          {/* Search Input inside Dropdown */}
          <li className="sticky top-0 z-10 bg-modal_bg px-3 pt-2 pb-1"> {/* Sticky container */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <SearchIcon />
              </span>
              <input
                ref={inputRef} // Assign ref
                type="text"
                placeholder="Search users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                // Prevent click inside input from closing dropdown
                onClick={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-10 py-1.5 text-sm bg-dark_blue text-white border border-light_blue-500/30 rounded-md focus:outline-none focus:ring-1 focus:ring-light_blue-500 focus:border-light_blue-500 placeholder-gray-400"
              />
              {searchText && (
                <button
                  type="button"
                  onClick={(e) => {
                      e.stopPropagation(); // Prevent dropdown close
                      setSearchText("");
                      inputRef.current?.focus(); // Keep focus
                  }}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-light_blue hover:text-light_blue-500"
                  aria-label="Clear search"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </li>

          {/* User List */}
          <div className="max-h-60 overflow-y-auto"> {/* Scrollable user list area */}
            {loading && <li className="text-gray-400 cursor-default select-none relative py-2 px-4">Loading...</li>}
            {!loading && users.length === 0 && searchText && (
                 <li className="text-gray-400 cursor-default select-none relative py-2 px-4">No users found for &quot;{searchText}&quot;.</li>
            )}
             {!loading && users.length === 0 && !searchText && (
                 <li className="text-gray-400 cursor-default select-none relative py-2 px-4">No users available.</li>
            )}
            {!loading && users.map((user) => (
              <li
                key={user.id}
                className={`relative cursor-pointer select-none py-2 pl-3 pr-9 text-white hover:bg-light_blue-500/10 ${selectedUserId === user.id ? 'bg-light_blue-500/20' : ''}`}
                role="option"
                aria-selected={selectedUserId === user.id}
                onClick={() => handleSelect(user.id)}
              >
                <span className={`block truncate ${selectedUserId === user.id ? 'font-semibold' : 'font-normal'}`}>
                  {getUserDisplayName(user)}
                </span>
              </li>
            ))}
          </div>
        </ul>
      )}
    </div>
  );
}