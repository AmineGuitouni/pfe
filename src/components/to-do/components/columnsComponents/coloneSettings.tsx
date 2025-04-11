"use client"
import {Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Button, useDisclosure} from "@heroui/react";
import { BiEdit } from "react-icons/bi";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";
import EditModal from "./editModal";

export default function ColoneSettings({deleteColumn,column_id}: {deleteColumn: () => void,column_id : string}) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
        <EditModal isOpen={isOpen} onOpenChange={onOpenChange} column_id={column_id}  />
        <Dropdown>
        <DropdownTrigger>
            <Button
                isIconOnly
                variant="light"
                size="sm"
                className="text-white/50 hover:bg-white/10 mb-2 h-[30px]"
                startContent={<IoEllipsisHorizontal size={20}/>}
            />
        </DropdownTrigger>
        <DropdownMenu aria-label="Static Actions">
            <DropdownItem key="edit" startContent={<BiEdit size={20} />} onPress={onOpen}>Edit column</DropdownItem>
            <DropdownItem key="delete" onPress={deleteColumn} startContent={<MdDeleteForever size={20} />} className="text-danger" color="danger">
            Delete column
            </DropdownItem>
        </DropdownMenu>
        </Dropdown>
    </>
  );
}
