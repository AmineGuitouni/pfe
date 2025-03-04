"use client";

import { User, Button } from "@heroui/react";
import { IoTrashOutline, IoPersonAddOutline } from "react-icons/io5";

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    initial: string;
  };
  variant: "remove" | "add";
  onAction?: (userId: string) => void;
}

export function UserCard({ user, variant, onAction }: UserCardProps) {
  return (
    <div className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
      <User
        avatarProps={{
          name: user.initial,
          className: "bg-white/20 text-white/60"
        }}
        description={user.email}
        name={user.name}
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