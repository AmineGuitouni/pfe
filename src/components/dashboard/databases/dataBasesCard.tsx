import React from 'react';
import { Card, CardBody } from "@heroui/react";
import {  Database } from 'lucide-react';
import Link from 'next/link';
import { Database as DatabaseType } from '@/app/api/v1/[user_id]/databases/list/route';
import { IoIosArrowForward } from 'react-icons/io';

export default function DatabaseCard({ database }: { database: DatabaseType }) {
  return (
    <Link href={`/dashboard/account/databases/${database.id}`} className="block">
      <Card 
        className="w-96 h-48 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 group border border-white/20"
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
              <IoIosArrowForward size={22} className="text-white/50 group-hover:text-light_blue-500 group-hover:translate-x-1 transition-all ease-linear"/>
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