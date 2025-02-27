"use client"
import { Card, CardBody, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, useDisclosure } from "@heroui/react";
import { Database as DatabaseIcon, Trash, MoreVertical, Edit, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Database, Database as DatabaseType } from '@/app/api/v1/[user_id]/databases/list/route';
import EditDataBaseModal from './EditDataBaseModal';

interface DatabaseCardProps {
  database: DatabaseType;
  deleteDatabase?: (databaseId: string) => Promise<boolean | undefined>
  editDatabase?: (databaseId: string, updatedDatabase: Omit<Database, "id" | "created_at">) => Promise<Response | undefined>
}

export default function DatabaseCard({ database, deleteDatabase, editDatabase }: DatabaseCardProps) {
  const { isOpen:isEditModalOpen, onOpen:onOpenEditModal, onOpenChange:OpenChangeEditModal } = useDisclosure();
  
  const handleDelete = async () => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${database.name}?`);
    if (confirmDelete) {
      const success = await deleteDatabase?.(database.id);
      if (success) {
        alert(`${database.name} deleted successfully!`);
      } else {
        alert(`Failed to delete ${database.name}. Please try again.`);
      }
    }
  };

  return (
    <Card
      className="w-96 h-48 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 group border border-white/20"
      isPressable
    >
      <CardBody className="p-6 flex flex-col justify-between overflow-hidden">
        {/* Top section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <DatabaseIcon className="w-5 h-5 text-[#8ab0e0]" />
              <h2 className="text-lg font-semibold text-white line-clamp-1 max-w-[250px] break-words">
                {database.name}
              </h2>
            </div>
            <Dropdown>
              <DropdownTrigger>
                <Button 
                  isIconOnly 
                  size="sm" 
                  variant="light" 
                  className="text-white/70 hover:text-white hover:bg-white/10"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu aria-label="Database actions">
                <DropdownItem 
                  key="view" 
                  startContent={<ArrowRight className="w-4 h-4" />}
                  as={Link}
                  href={`/dashboard/account/databases/${database.id}`}
                >
                  View Details
                </DropdownItem>
                <DropdownItem 
                  key="edit" 
                  startContent={<Edit className="w-4 h-4" />}
                  onPress={() => onOpenEditModal()}
                >
                  Edit Database
                </DropdownItem>
                <DropdownItem 
                  key="delete" 
                  startContent={<Trash className="w-4 h-4" />}
                  className="text-danger"
                  color="danger"
                  onPress={handleDelete}
                >
                  Delete Database
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
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
      {isEditModalOpen && (
        <EditDataBaseModal 
          database={database} 
          isOpen={isEditModalOpen}
          onOpenChange={OpenChangeEditModal}
          editDatabase={editDatabase}
        />
      )}
    </Card>
  );
}