"use client";

import { User as UserType } from "@/components/users/types";
import { User, Button } from "@heroui/react";
import { IoTrashOutline, IoPersonAddOutline } from "react-icons/io5";

interface UserCardProps {
  user: UserType;
  variant: "remove" | "add";
  onAction?: (userId: string) => void;
}

export function UserCard({ user, variant, onAction }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
      <User
        avatarProps={{
          name: user.first_name,
          className: "bg-white/20 text-white/60"
        }}
        description={user.email}
        name={user.first_name + " " + user.last_name}
      />
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className={`text-white/70 ${
          variant === "remove"
            ? "hover:text-red-500"
            : "hover:text-[#8ab0e0]"
        } hover:bg-white/10`}
        onPress={() => onAction?.(user.id)}
      >
        {variant === "remove" ? (
          <IoTrashOutline className="w-5 h-5" />
        ) : (
          <IoPersonAddOutline className="w-5 h-5" />
        )}
      </Button>
    </div>
  );
}


export function UserCardSkeleton() {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors animate-pulse">
      <div className="flex items-center gap-3">
        {/* Avatar skeleton */}
        <div className="w-10 h-10 rounded-full bg-white/10"></div>
        
        <div className="flex flex-col gap-1">
          {/* Name skeleton */}
          <div className="h-4 w-32 bg-white/10 rounded"></div>
          
          {/* Email skeleton */}
          <div className="h-3 w-40 bg-white/10 rounded"></div>
        </div>
      </div>
      
      {/* Button skeleton */}
      <div className="w-8 h-8 rounded-full bg-white/10"></div>
    </div>
  );
}