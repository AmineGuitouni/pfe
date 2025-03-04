"use client";

import { FaUsers } from "react-icons/fa";
import { IoSearchOutline } from "react-icons/io5";
import { Input } from "@heroui/react";
import { UserCard } from "./UserCard";

interface User {
  id: string;
  name: string;
  email: string;
  initial: string;
}

interface UserCardProps {
  currentMembers: User[];
  availableUsers: User[];
  onSearch?: (query: string) => void;
  onAddUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
}

export default function UserCardLists({
  currentMembers,
  availableUsers,
  onSearch,
  onAddUser,
  onRemoveUser,
}: UserCardProps) {
  return (
    <div className="p-4 text-white dark flex flex-col gap-4">
      <h3 className="text-md font-medium text-white/80 flex items-center gap-2">
        <FaUsers className="w-4 h-4" />
        Group Members
      </h3>
      <Input
        placeholder="Search users..."
        size="sm"
        className="w-full max-w-[300px] dark text-white"
        endContent={<IoSearchOutline className="text-light_blue-500/70" />}
        variant="bordered"
        onChange={(e) => onSearch?.(e.target.value)}
      />
      
      <div className="border border-white/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white/60 mb-3">CURRENT MEMBERS</h4>
        {currentMembers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            variant="remove"
            onAction={onRemoveUser}
          />
        ))}
      </div>
      
      <div className="border border-white/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-white/60 mb-3">AVAILABLE USERS</h4>
        {availableUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            variant="add"
            onAction={onAddUser}
          />
        ))}
      </div>
    </div>
  );
}
