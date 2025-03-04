"use client";

import { Card, cn } from "@heroui/react";


interface PermissionCardProps {
  permission: string;
  onPermissionChange?: (id: string, is_active: boolean) => void;
  is_active: boolean
}

export default function PermissionCard({ permission, onPermissionChange, is_active }: PermissionCardProps) {
  return (
    <Card
      className={cn(
        "border border-white/20 rounded-lg w-full p-4 flex justify-center items-center bg-transparent hover:bg-white/5 transition-colors",
        is_active && "bg-white/10 border-light_blue-500 text-light_blue-500"
      )}
      onPress={() => onPermissionChange?.(permission, !is_active)}
      isPressable
    >
      <span className="text-center font-medium capitalize flex items-center gap-2">
        {permission}
      </span>
    </Card>
  );
}
