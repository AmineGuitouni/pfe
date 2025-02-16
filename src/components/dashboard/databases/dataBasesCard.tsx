import React from 'react';
import { Card, CardBody } from "@heroui/react";
import { ChevronRight, Database } from 'lucide-react';
import Link from 'next/link';
import { Database as DatabaseType } from '@/app/api/v1/[user_id]/databases/list/route';

export default function DatabaseCard({ database }: { database: DatabaseType }) {
  return (
    <Link href={`/dashboard/account/databases/${database.id}`} className="block">
      <Card 
        className="w-96 h-48 bg-[#081e25] hover:bg-[#212c30] transition-colors duration-200 group border border-white/10"
        isPressable
      >
        <CardBody className="p-6 flex flex-col justify-between overflow-hidden">
          {/* Top section */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#8ab0e0]" />
                <h2 className="text-lg font-semibold text-white">
                  {database.name}
                </h2>
              </div>
              <ChevronRight 
                className="w-5 h-5 text-white/50 group-hover:text-[#7dd5de] transition-all duration-200 group-hover:translate-x-1"
              />
            </div>
          </div>

          {/* Bottom section */}
          <div className="space-y-1.5">
            <p className="flex items-center gap-2 text-sm text-white/60">
              <span>Created:</span>
              <time dateTime={database.created_at}>
                {new Date(database.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </time>
            </p>
            <p className="flex items-center gap-2 text-sm text-white/60">
              <span>Endpoint:</span>
              <code className="truncate text-xs font-mono">
                {database.connection_config.NEXT_PUBLIC_SUPABASE_URL}
              </code>
            </p>
          </div>
        </CardBody>
      </Card>
    </Link>
  );
}